import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { platforms, type Platform } from "@/lib/platforms";
import { PlatformIcon } from "@/lib/platform-icons";
import { Switch } from "@/components/ui/switch";
import { listPlatformContentAdmin } from "@/lib/platform-content.functions";
import { listToolSettingsAdmin, saveToolSetting } from "@/lib/site-content.functions";
import { toolSettingMap, type ToolSettingMap } from "@/lib/site-content";
import { SITE_DATA_QUERY_KEY } from "@/lib/use-site-data";
import { AiAssist } from "@/components/ai-writer/ai-assist";

export const Route = createFileRoute("/_authenticated/admin/tools/")({
  component: AdminTools,
});

function AdminTools() {
  const listContent = useServerFn(listPlatformContentAdmin);
  const listSettings = useServerFn(listToolSettingsAdmin);

  const { data: rows } = useQuery({
    queryKey: ["admin-platform-content"],
    queryFn: () => listContent(),
  });
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-tool-settings"],
    queryFn: () => listSettings(),
  });

  const statusBySlug = new Map(
    (rows ?? []).map((r) => [r.slug, r.status as "draft" | "published"]),
  );
  const settingMap: ToolSettingMap = toolSettingMap(settings ?? []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Tools</h1>
        <p className="text-sm text-muted-foreground">
          Turn each downloader on or off, rename it, and edit its short description. Use “Edit
          article” for the full SEO page content.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {platforms.map((p) => (
            <ToolCard
              key={p.slug}
              platform={p}
              setting={settingMap[p.slug]}
              status={statusBySlug.get(p.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolCard({
  platform,
  setting,
  status,
}: {
  platform: Platform;
  setting: ToolSettingMap[string] | undefined;
  status?: "draft" | "published";
}) {
  const queryClient = useQueryClient();
  const save = useServerFn(saveToolSetting);

  const [enabled, setEnabled] = useState(setting?.enabled ?? true);
  const [name, setName] = useState(setting?.name ?? "");
  const [tagline, setTagline] = useState(setting?.tagline ?? "");
  const [description, setDescription] = useState(setting?.description ?? "");

  const mutation = useMutation({
    mutationFn: (nextEnabled?: boolean) =>
      save({
        data: {
          slug: platform.slug,
          enabled: nextEnabled ?? enabled,
          name,
          tagline,
          description,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tool-settings"] });
      queryClient.invalidateQueries({ queryKey: SITE_DATA_QUERY_KEY });
      toast.success(`${name || platform.name} saved`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      style={{ ["--brand" as string]: platform.color }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <PlatformIcon slug={platform.slug} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">
            {name || platform.name}
            {!enabled && (
              <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[0.7rem] font-semibold text-destructive">
                disabled
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">/{platform.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {enabled ? "On" : "Off"}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v);
              mutation.mutate(v);
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-semibold text-muted-foreground">Name</label>
            <AiAssist
              fieldKind="name"
              value={name}
              onApply={setName}
              context={`Downloader tool page for ${platform.name}. ${platform.tagline}`}
              label="tool name"
            />
          </div>
          <input
            value={name}
            placeholder={platform.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-semibold text-muted-foreground">Tagline</label>
            <AiAssist
              fieldKind="tagline"
              value={tagline}
              onApply={setTagline}
              context={`Downloader tool page for ${platform.name}. ${platform.description}`}
              label="tagline"
            />
          </div>
          <input
            value={tagline}
            placeholder={platform.tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-semibold text-muted-foreground">
              Short description (homepage card)
            </label>
            <AiAssist
              fieldKind="description"
              value={description}
              onApply={setDescription}
              context={`Downloader tool page for ${platform.name}. ${platform.tagline}`}
              label="description"
            />
          </div>
          <textarea
            rows={2}
            value={description}
            placeholder={platform.description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          to="/admin/tools/$slug"
          params={{ slug: platform.slug }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileText className="h-4 w-4" /> Edit article
          <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-[0.7rem]">
            {status ?? "default"}
          </span>
        </Link>
        <button
          onClick={() => mutation.mutate(undefined)}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
      </div>
    </div>
  );
}
