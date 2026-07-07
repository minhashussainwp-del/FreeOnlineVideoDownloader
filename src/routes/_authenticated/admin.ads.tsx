import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { getAdsAdmin, saveAd } from "@/lib/ads.functions";
import { AD_PLACEMENTS, adMap, type AdPlacement, type AdRow } from "@/lib/ads";
import { SITE_DATA_QUERY_KEY } from "@/lib/use-site-data";

export const Route = createFileRoute("/_authenticated/admin/ads")({
  component: AdminAds,
});

type Draft = { name: string; code: string; link_url: string; enabled: boolean };

const EMPTY_DRAFT: Draft = { name: "", code: "", link_url: "", enabled: false };

const inputCls =
"w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function AdminAds() {
  const queryClient = useQueryClient();
  const load = useServerFn(getAdsAdmin);
  const save = useServerFn(saveAd);

  const [drafts, setDrafts] = useState<Record<AdPlacement, Draft>>({
    top: EMPTY_DRAFT,
    bottom: EMPTY_DRAFT,
    left: EMPTY_DRAFT,
    right: EMPTY_DRAFT,
    download: EMPTY_DRAFT,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: () => load(),
  });

  useEffect(() => {
    if (!data) return;
    const map = adMap(data as AdRow[]);
    setDrafts((prev) => {
      const next = { ...prev };
      for (const { placement } of AD_PLACEMENTS) {
        const row = map[placement];
        next[placement] = {
          name: row?.name ?? "",
          code: row?.code ?? "",
          link_url: row?.link_url ?? "",
          enabled: row?.enabled ?? false,
        };
      }
      return next;
    });
  }, [data]);

  const saver = useMutation({
    mutationFn: (placement: AdPlacement) => {
      const d = drafts[placement];
      return save({
        data: {
          placement,
          name: d.name.trim() || null,
          code: d.code.trim() || null,
          link_url: d.link_url.trim() || null,
          enabled: d.enabled,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: SITE_DATA_QUERY_KEY });
      toast.success("Ad saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = (placement: AdPlacement, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [placement]: { ...prev[placement], ...patch } }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Megaphone className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Ads</h1>
          <p className="text-sm text-muted-foreground">
            Manage ad slots on the platform/download pages. Paste your ad network code (AdSense,
            Adsterra, Mediavine, etc.) and toggle each slot on.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {AD_PLACEMENTS.map(({ placement, label, description, usesLink }) => {
            const d = drafts[placement];
            const saving = saver.isPending && saver.variables === placement;
            return (
              <div key={placement} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">{label}</h2>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={(e) => update(placement, { enabled: e.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                    {d.enabled ? "Enabled" : "Disabled"}
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Label (internal name)</label>
                    <input
                      value={d.name}
                      onChange={(e) => update(placement, { name: e.target.value })}
                      placeholder="e.g. Adsterra banner 300x250"
                      className={inputCls}
                    />
                  </div>

                  {usesLink ? (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Ad link (opens in new tab)</label>
                      <input
                        value={d.link_url}
                        onChange={(e) => update(placement, { link_url: e.target.value })}
                        placeholder="https://your-ad-link.example"
                        className={inputCls}
                      />
                      <p className="text-xs text-muted-foreground">
                        When a visitor presses Download, this link opens in a new tab and the
                        download continues in the same tab.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Ad code (HTML / JavaScript)</label>
                      <textarea
                        value={d.code}
                        onChange={(e) => update(placement, { code: e.target.value })}
                        placeholder="<script>...</script> or the banner code from your ad network"
                        rows={6}
                        className={`${inputCls} font-mono text-xs`}
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => saver.mutate(placement)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
