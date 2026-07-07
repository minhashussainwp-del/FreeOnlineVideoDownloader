import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Trash2, Star, Pencil, X, KeyRound } from "lucide-react";
import {
  listAiProviders,
  saveAiProvider,
  deleteAiProvider,
} from "@/lib/ai-writer.functions";
import {
  PROVIDER_PRESETS,
  presetFor,
  providerLabel,
  type AiProvider,
  type ProviderType,
} from "@/lib/ai-writer";

type FormState = {
  id?: string;
  name: string;
  provider_type: ProviderType;
  base_url: string;
  model: string;
  api_key: string;
  enabled: boolean;
  is_default: boolean;
};

function emptyForm(): FormState {
  const preset = PROVIDER_PRESETS[0];
  return {
    name: preset.label,
    provider_type: preset.type,
    base_url: preset.base_url,
    model: preset.exampleModel,
    api_key: "",
    enabled: true,
    is_default: false,
  };
}

export function ProviderManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAiProviders);
  const saveFn = useServerFn(saveAiProvider);
  const deleteFn = useServerFn(deleteAiProvider);

  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["ai-providers"],
    queryFn: () => listFn(),
  });

  const save = useMutation({
    mutationFn: (f: FormState) => saveFn({ data: f }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
      setForm(null);
      setError(null);
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-providers"] }),
  });

  const startEdit = (p: AiProvider) => {
    setError(null);
    setForm({
      id: p.id,
      name: p.name,
      provider_type: p.provider_type,
      base_url: p.base_url,
      model: p.model,
      api_key: "",
      enabled: p.enabled,
      is_default: p.is_default,
    });
  };

  const onTypeChange = (type: ProviderType) => {
    if (!form) return;
    const preset = presetFor(type);
    setForm({
      ...form,
      provider_type: type,
      base_url: preset.base_url,
      model: form.model || preset.exampleModel,
      name: form.id ? form.name : preset.label,
    });
  };

  const preset = form ? presetFor(form.provider_type) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">AI Providers</h2>
          <p className="text-sm text-muted-foreground">
            Add OpenAI, OpenRouter, Gemini, DeepSeek, Claude or any custom OpenAI-compatible API.
          </p>
        </div>
        {!form && (
          <button
            onClick={() => {
              setError(null);
              setForm(emptyForm());
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add provider
          </button>
        )}
      </div>

      {form && preset && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold">
              {form.id ? "Edit provider" : "New provider"}
            </h3>
            <button
              onClick={() => setForm(null)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-2xl text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Provider type</span>
              <select
                value={form.provider_type}
                onChange={(e) => onTypeChange(e.target.value as ProviderType)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              >
                {PROVIDER_PRESETS.map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium">Label</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My OpenAI key"
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Base URL</span>
              <input
                value={form.base_url}
                onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                disabled={!preset.editableBaseUrl}
                placeholder="https://api.example.com/v1"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 disabled:opacity-60"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium">Model name</span>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder={preset.exampleModel}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium">
                API key {form.id && <span className="text-muted-foreground">(leave blank to keep)</span>}
              </span>
              <input
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                placeholder={preset.keyHint}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              />
              Enabled
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
              Use as default
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => save.mutate(form)}
              disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save provider
            </button>
            <button
              onClick={() => setForm(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : !providers || providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <KeyRound className="mx-auto mb-2 h-6 w-6" />
          No providers yet. Add one to start writing with AI.
        </div>
      ) : (
        <div className="grid gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold">{p.name}</span>
                  {p.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      <Star className="h-3 w-3" /> Default
                    </span>
                  )}
                  {!p.enabled && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {providerLabel(p.provider_type)} · {p.model} · key {p.api_key_preview}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(p)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-2xl text-muted-foreground hover:bg-secondary"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete provider "${p.name}"?`)) remove.mutate(p.id);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-2xl text-destructive hover:bg-destructive/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
