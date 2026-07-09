import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Save, Send, ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getPlatform } from "@/lib/platforms";
import type { RichPlatformArticle, Benefit, Step, ComparisonRow, QA } from "@/lib/platform-article";
import {
  getPlatformContentAdmin,
  savePlatformContent,
  generatePlatformContent,
} from "@/lib/platform-content.functions";
import { AiAssist } from "@/components/ai-writer/ai-assist";

export const Route = createFileRoute("/_authenticated/admin/tools/$slug")({
  component: AdminToolEditor,
});

const inputCls =
"w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelCls = "text-sm font-semibold text-foreground";

function Field({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className={labelCls}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function AdminToolEditor() {
  const { slug } = useParams({ from: "/_authenticated/admin/tools/$slug" });
  const platform = getPlatform(slug);
  const queryClient = useQueryClient();

  const load = useServerFn(getPlatformContentAdmin);
  const save = useServerFn(savePlatformContent);
  const generate = useServerFn(generatePlatformContent);

  const [article, setArticle] = useState<RichPlatformArticle | null>(null);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-platform-content", slug],
    queryFn: () => load({ data: { slug } }),
  });

  useEffect(() => {
    if (data) {
      setArticle(data.article);
      setStatus(data.status);
    }
  }, [data]);

  const gen = useMutation({
    mutationFn: () => generate({ data: { slug } }),
    onSuccess: (result) => {
      setArticle(result);
      toast.success("Content generated — review and save.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saver = useMutation({
    mutationFn: (nextStatus: "draft" | "published") => {
      if (!article) throw new Error("Nothing to save");
      return save({
        data: {
          slug,
          status: nextStatus,
          content: article as unknown as Record<string, unknown>,
        },
      });
    },
    onSuccess: (_r, nextStatus) => {
      setStatus(nextStatus);
      queryClient.invalidateQueries({ queryKey: ["admin-platform-content"] });
      toast.success(nextStatus === "published" ? "Published to the live page." : "Draft saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!platform) {
    return <p className="text-sm text-muted-foreground">Unknown platform.</p>;
  }

  const update = <K extends keyof RichPlatformArticle>(key: K, value: RichPlatformArticle[K]) =>
    setArticle((a) => (a ? { ...a, [key]: value } : a));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tools"
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">{platform.name} tool page</h1>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{status}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/$platform"
            params={{ platform: slug }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> View
          </Link>
          <button
            onClick={() => gen.mutate()}
            disabled={gen.isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate with AI
          </button>
        </div>
      </div>

      {isLoading || !article ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Author">
              <input className={inputCls} value={article.authorName} onChange={(e) => update("authorName", e.target.value)} />
            </Field>
            <Field label="Last updated">
              <input className={inputCls} value={article.lastUpdated} onChange={(e) => update("lastUpdated", e.target.value)} />
            </Field>
            <Field label="Reading minutes">
              <input
                type="number"
                className={inputCls}
                value={article.readingMinutes}
                onChange={(e) => update("readingMinutes", Number(e.target.value) || 1)}
              />
            </Field>
          </div>

          <Field
            label="Quick answer (AEO)"
            action={
              <AiAssist
                fieldKind="description"
                value={article.answer}
                onApply={(t) => update("answer", t)}
                context={`${platform.name} downloader tool page. Quick answer for the "how do I download" question.`}
                label="quick answer"
              />
            }
          >
            <textarea className={inputCls} rows={2} value={article.answer} onChange={(e) => update("answer", e.target.value)} />
          </Field>

          <LinesField label="Intro paragraphs (one per line)" value={article.intro} onChange={(v) => update("intro", v)} />

          <PairListField
            label="Key benefits"
            a="Title"
            b="Text"
            rows={article.benefits}
            toRow={(x) => [x.title, x.text]}
            fromRow={([title, text]) => ({ title, text }) as Benefit}
            onChange={(v) => update("benefits", v)}
          />

          <PairListField
            label="How-to steps (general)"
            a="Title"
            b="Text"
            rows={article.howToGeneral}
            toRow={(x) => [x.title, x.text]}
            fromRow={([title, text]) => ({ title, text }) as Step}
            onChange={(v) => update("howToGeneral", v)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <LinesField label="Android steps" value={article.androidSteps} onChange={(v) => update("androidSteps", v)} rows={4} />
            <LinesField label="iPhone steps" value={article.iphoneSteps} onChange={(v) => update("iphoneSteps", v)} rows={4} />
            <LinesField label="PC / Mac steps" value={article.pcSteps} onChange={(v) => update("pcSteps", v)} rows={4} />
          </div>

          <Field
            label="Formats & quality"
            action={
              <AiAssist
                fieldKind="description"
                value={article.formats}
                onApply={(t) => update("formats", t)}
                context={`${platform.name} downloader tool page. Describe supported formats and quality options.`}
                label="formats & quality"
              />
            }
          >
            <textarea className={inputCls} rows={3} value={article.formats} onChange={(e) => update("formats", e.target.value)} />
          </Field>

          <LinesField label="Use cases (one per line)" value={article.useCases} onChange={(v) => update("useCases", v)} />
          <LinesField label="Safety & legal (one per line)" value={article.safety} onChange={(v) => update("safety", v)} />
          <LinesField label="Troubleshooting (one per line)" value={article.troubleshooting} onChange={(v) => update("troubleshooting", v)} />

          <TripleListField
            label="Comparison (online vs app)"
            rows={article.comparison}
            onChange={(v) => update("comparison", v)}
          />

          <Field
            label="Alternatives"
            action={
              <AiAssist
                fieldKind="description"
                value={article.alternatives}
                onApply={(t) => update("alternatives", t)}
                context={`${platform.name} downloader tool page. Describe alternative tools or methods.`}
                label="alternatives"
              />
            }
          >
            <textarea className={inputCls} rows={3} value={article.alternatives} onChange={(e) => update("alternatives", e.target.value)} />
          </Field>

          <PairListField
            label="Quick answers (Q & A)"
            a="Question"
            b="Answer"
            rows={article.quickAnswers}
            toRow={(x) => [x.q, x.a]}
            fromRow={([q, a]) => ({ q, a }) as QA}
            onChange={(v) => update("quickAnswers", v)}
          />

          <PairListField
            label="FAQs (Q & A)"
            a="Question"
            b="Answer"
            rows={article.faqs}
            toRow={(x) => [x.q, x.a]}
            fromRow={([q, a]) => ({ q, a }) as QA}
            onChange={(v) => update("faqs", v)}
          />

          <LinesField label="SEO keywords (one per line)" value={article.keywords} onChange={(v) => update("keywords", v)} />

          <div className="sticky bottom-4 flex items-center justify-end gap-2 rounded-2xl border border-border bg-card/90 p-3 backdrop-blur">
            <button
              onClick={() => saver.mutate("draft")}
              disabled={saver.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save draft
            </button>
            <button
              onClick={() => saver.mutate("published")}
              disabled={saver.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              {saver.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LinesField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        className={inputCls}
        rows={rows}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
      />
    </Field>
  );
}

function PairListField<T>({
  label,
  a,
  b,
  rows,
  toRow,
  fromRow,
  onChange,
}: {
  label: string;
  a: string;
  b: string;
  rows: T[];
  toRow: (x: T) => [string, string];
  fromRow: (r: [string, string]) => T;
  onChange: (v: T[]) => void;
}) {
  const pairs = rows.map(toRow);
  const set = (next: [string, string][]) => onChange(next.map(fromRow));
  return (
    <Field label={label}>
      <div className="space-y-2">
        {pairs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={`${inputCls} sm:w-1/3`}
              placeholder={a}
              value={p[0]}
              onChange={(e) => {
                const next = [...pairs];
                next[i] = [e.target.value, p[1]];
                set(next);
              }}
            />
            <input
              className={inputCls}
              placeholder={b}
              value={p[1]}
              onChange={(e) => {
                const next = [...pairs];
                next[i] = [p[0], e.target.value];
                set(next);
              }}
            />
            <button
              onClick={() => set(pairs.filter((_, j) => j !== i))}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => set([...pairs, ["", ""]])}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </Field>
  );
}

function TripleListField({
  label,
  rows,
  onChange,
}: {
  label: string;
  rows: ComparisonRow[];
  onChange: (v: ComparisonRow[]) => void;
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={`${inputCls} sm:w-1/4`}
              placeholder="Feature"
              value={r.feature}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...r, feature: e.target.value };
                onChange(next);
              }}
            />
            <input
              className={inputCls}
              placeholder="Online tool"
              value={r.online}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...r, online: e.target.value };
                onChange(next);
              }}
            />
            <input
              className={inputCls}
              placeholder="App"
              value={r.app}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...r, app: e.target.value };
                onChange(next);
              }}
            />
            <button
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...rows, { feature: "", online: "", app: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      </div>
    </Field>
  );
}
