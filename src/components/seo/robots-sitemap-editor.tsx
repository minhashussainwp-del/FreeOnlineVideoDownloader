import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Sparkles,
  Save,
  RotateCcw,
  FileCode2,
  Bot,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  getSeoResources,
  saveSeoResource,
  generateSeoResource,
  type SeoResources,
} from "@/lib/seo-audit.functions";

type Kind = "robots" | "sitemap";

function ResourceEditor({
  kind,
  title,
  description,
  href,
  initialText,
  isCustom,
  onSaved,
}: {
  kind: Kind;
  title: string;
  description: string;
  href: string;
  initialText: string;
  isCustom: boolean;
  onSaved: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const generateFn = useServerFn(generateSeoResource);
  const saveFn = useServerFn(saveSeoResource);

  const generate = useMutation({
    mutationFn: () => generateFn({ data: { kind, instruction } }),
    onMutate: () => {
      setError(null);
      setStatus(null);
    },
    onSuccess: (res) => {
      setText(res.text);
      setStatus("AI draft generated — review and save to publish.");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Generation failed"),
  });

  const save = useMutation({
    mutationFn: (payload: string | null) => saveFn({ data: { kind, text: payload } }),
    onMutate: () => {
      setError(null);
      setStatus(null);
    },
    onSuccess: () => {
      setStatus("Saved and live.");
      onSaved();
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCode2 className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold">{title}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${isCustom ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {isCustom ? "Custom" : "Auto"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View live <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* AI generate row */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Bot className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={
              kind === "robots"
                ? "e.g. block /search and allow all AI crawlers"
                : "e.g. drop low-priority legal pages, raise blog priority"
            }
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary/70 disabled:opacity-60"
        >
          {generate.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          Generate with AI
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={kind === "sitemap" ? 14 : 8}
        className="mt-3 w-full resize-y rounded-xl border border-border bg-background p-3 font-mono text-xs leading-relaxed"
      />

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {status && (
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-500">
          <CheckCircle2 className="h-4 w-4" /> {status}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => save.mutate(text)}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save &amp; publish
        </button>
        {isCustom && (
          <button
            onClick={() => save.mutate(null)}
            disabled={save.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" /> Reset to auto
          </button>
        )}
      </div>
    </div>
  );
}

export function RobotsSitemapEditor() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSeoResources);
  const { data, isLoading } = useQuery<SeoResources>({
    queryKey: ["seo-resources"],
    queryFn: () => getFn(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["seo-resources"] });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold">Robots &amp; Sitemap</h2>
        <p className="text-sm text-muted-foreground">
          Generate and edit your crawl rules with AI. Saved changes go live instantly; “Auto” means
          the file is generated from your live pages and posts.
        </p>
      </div>

      <ResourceEditor
        kind="robots"
        title="robots.txt"
        description="Controls what search engines and AI crawlers can access."
        href="/robots.txt"
        initialText={data.robotsText}
        isCustom={data.robotsIsCustom}
        onSaved={refresh}
      />

      <ResourceEditor
        kind="sitemap"
        title="sitemap.xml"
        description="Lists your URLs for search engines. Auto mode always reflects new posts."
        href="/sitemap.xml"
        initialText={data.sitemapText}
        isCustom={data.sitemapIsCustom}
        onSaved={refresh}
      />
    </div>
  );
}
