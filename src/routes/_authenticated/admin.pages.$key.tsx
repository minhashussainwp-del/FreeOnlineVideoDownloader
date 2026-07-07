import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pageDef, type Field, type PageDef, type ContentValue } from "@/lib/site-content";
import { getSiteContentAdmin, saveSiteContent } from "@/lib/site-content.functions";
import { SITE_DATA_QUERY_KEY } from "@/lib/use-site-data";

export const Route = createFileRoute("/_authenticated/admin/pages/$key")({
  component: AdminPageEditor,
});

type Pair = { a: string; b: string };

function seedForm(def: PageDef, existing: ContentValue): ContentValue {
  const form: ContentValue = {};
  for (const f of def.fields) {
    const saved = existing[f.id];
    if (saved !== undefined && saved !== null) {
      form[f.id] = saved;
    } else if (def.dataDriven) {
      form[f.id] = def.defaults[f.id];
    } else {
      form[f.id] = f.type === "pairs" ? [] : "";
    }
  }
  return form;
}

function AdminPageEditor() {
  const { key } = useParams({ from: "/_authenticated/admin/pages/$key" });
  const def = pageDef(key);
  const queryClient = useQueryClient();
  const load = useServerFn(getSiteContentAdmin);
  const save = useServerFn(saveSiteContent);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-site-content", key],
    queryFn: () => load({ data: { key } }),
    enabled: !!def,
  });

  const [form, setForm] = useState<ContentValue | null>(null);

  useEffect(() => {
    if (def && existing !== undefined && form === null) {
      setForm(seedForm(def, existing));
    }
  }, [def, existing, form]);

  const mutation = useMutation({
    mutationFn: () => save({ data: { key, content: form ?? {} } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-content", key] });
      queryClient.invalidateQueries({ queryKey: SITE_DATA_QUERY_KEY });
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!def) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Unknown page.</p>
        <Link to="/admin/pages" className="mt-4 inline-flex text-sm font-semibold text-primary">
          Back to pages
        </Link>
      </div>
    );
  }

  if (isLoading || form === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const setField = (id: string, value: unknown) => setForm((f) => ({ ...(f ?? {}), [id]: value }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/pages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All pages
      </Link>

      <div className="mb-6 mt-3">
        <h1 className="font-display text-2xl font-bold">{def.label}</h1>
        <p className="text-sm text-muted-foreground">{def.description}</p>
      </div>

      <div className="space-y-6">
        {def.fields.map((f) => (
          <FieldEditor key={f.id} field={f} value={form[f.id]} onChange={(v) => setField(f.id, v)} />
        ))}
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-brand transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <div className="mb-1.5">
      <label className="block text-sm font-semibold">{field.label}</label>
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );

  if (field.type === "text") {
    return (
      <div>
        {label}
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring"
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          rows={3}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-y rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring"
        />
      </div>
    );
  }

  // pairs
  const items: Pair[] = Array.isArray(value)
    ? (value as unknown[]).map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return { a: typeof o.a === "string" ? o.a : "", b: typeof o.b === "string" ? o.b : "" };
      })
    : [];

  const update = (i: number, patch: Partial<Pair>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { a: "", b: "" }]);

  return (
    <div>
      {label}
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              <button
                onClick={() => remove(i)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
            <input
              value={it.a}
              placeholder={field.labelA}
              onChange={(e) => update(i, { a: e.target.value })}
              className="mb-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
            {field.multilineB ? (
              <textarea
                rows={2}
                value={it.b}
                placeholder={field.labelB}
                onChange={(e) => update(i, { b: e.target.value })}
                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            ) : (
              <input
                value={it.b}
                placeholder={field.labelB}
                onChange={(e) => update(i, { b: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            )}
          </div>
        ))}
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>
    </div>
  );
}
