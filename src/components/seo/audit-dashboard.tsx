import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  AlertTriangle,
  CalendarClock,
  Gauge,
  FileText,
  ExternalLink,
  ShieldAlert,
  Flame,
  ListChecks,
  CheckCircle2,
  RefreshCw,
  Wand2,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  runBulkSeoAudit,
  listSeoRuns,
  getAuditOverview,
  getSeoSettings,
  saveSeoSettings,
  getPendingAuditCount,
  applyPostSeoFixes,
  previewPostSeoFixes,
  type SeoAuditRow,
  type PreviewFixesResult,
} from "@/lib/seo-audit.functions";
import { scoreTone, fixGuideFor, autoFixableIssues } from "@/lib/seo-audit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


function Delta({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || previous === undefined) {
    return <span className="text-xs text-muted-foreground">new</span>;
  }
  const diff = current - previous;
  if (diff === 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> 0
      </span>
    );
  const up = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-500" : "text-destructive"}`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {diff}
    </span>
  );
}

function severityStyle(sev: string): string {
  if (sev === "critical") return "bg-destructive/10 text-destructive";
  if (sev === "warning") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}

function AuditRow({ row }: { row: SeoAuditRow }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewFixesResult | null>(null);
  const qc = useQueryClient();
  const applyFn = useServerFn(applyPostSeoFixes);
  const previewFn = useServerFn(previewPostSeoFixes);

  const fixable = autoFixableIssues(row.issues);
  const canAutoFix = !!row.post_id && fixable.length > 0;

  // Step 1: generate a preview of the suggested changes (no writes yet).
  const previewFixes = useMutation({
    mutationFn: () => previewFn({ data: { postId: row.post_id! } }),
    onSuccess: (res) => {
      if (res.fixedCount === 0) {
        toast.info("Nothing to auto-fix — remaining issues need manual edits.");
        return;
      }
      setPreview(res);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not build preview"),
  });

  // Step 2: apply the reviewed changes verbatim, then re-audit.
  const applyFixes = useMutation({
    mutationFn: () =>
      applyFn({
        data: { postId: row.post_id!, auditId: row.id, proposal: preview?.proposal ?? {} },
      }),
    onSuccess: (res) => {
      if (res.fixedCount === 0) {
        toast.info("Nothing to auto-fix — remaining issues need manual edits.");
      } else {
        const delta = res.scoreAfter - res.scoreBefore;
        toast.success(
          `Applied ${res.fixedCount} fix${res.fixedCount === 1 ? "" : "es"} · score ${res.scoreBefore} → ${res.scoreAfter}${delta > 0 ? ` (+${delta})` : ""}`,
        );
      }
      setPreview(null);
      setOpen(true);
      qc.invalidateQueries({ queryKey: ["seo-overview"] });
      qc.invalidateQueries({ queryKey: ["seo-runs"] });
      qc.invalidateQueries({ queryKey: ["seo-pending"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not apply fixes"),
  });


  return (
    <>
      <tr className="border-b border-border/60 hover:bg-secondary/40">
        <td className="py-3 pr-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-start gap-2 text-left"
          >
            <ChevronDown
              className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
            <span className="text-sm font-medium line-clamp-1">
              {row.post_title || row.post_slug || "Untitled"}
            </span>
          </button>
        </td>
        <td className="py-3 px-3 text-center">
          <span className={`font-display text-lg font-bold ${scoreTone(row.score)}`}>
            {row.score}
          </span>
        </td>
        <td className="py-3 px-3 text-center text-sm font-semibold">{row.grade}</td>
        <td className="py-3 px-3 text-center">
          <Delta current={row.score} previous={row.previous_score} />
        </td>
        <td className="py-3 px-3 text-center">
          {row.issues.length === 0 ? (
            <span className="text-xs text-emerald-500">clean</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber-500" /> {row.issues.length}
            </span>
          )}
        </td>
        <td className="py-3 pl-3 text-right">
          <div className="flex items-center justify-end gap-2">
            {canAutoFix && (
              <button
                onClick={() => previewFixes.mutate()}
                disabled={previewFixes.isPending || applyFixes.isPending}
                title={`Preview AI fixes for ${fixable.length} issue${fixable.length === 1 ? "" : "s"}`}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
              >
                {previewFixes.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
                Preview fixes
              </button>
            )}
            {row.post_slug && (
              <Link
                to="/blog/$slug"
                params={{ slug: row.post_slug }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border/60 bg-secondary/20">
          <td colSpan={6} className="px-4 py-3">
            {row.issues.length === 0 ? (
              <p className="text-sm text-emerald-500">No SEO issues found for this post. 🎉</p>
            ) : (
              <ul className="space-y-2.5">
                {row.issues.map((issue) => {
                  const guide = fixGuideFor(issue.id);
                  return (
                    <li key={issue.id} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2 text-sm">
                      <span
                        className={`mt-0.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${severityStyle(issue.severity)}`}
                      >
                        {issue.severity}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{issue.label}:</span>{" "}
                        <span className="text-muted-foreground">{issue.detail}</span>
                        {guide && (
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3 text-primary" />
                              {guide.where}
                            </span>
                            <span className="text-muted-foreground/70">·</span>
                            <span className="text-muted-foreground">{guide.how}</span>
                            {row.post_id && (
                              <Link
                                to="/admin/$id"
                                params={{ id: row.post_id }}
                                hash={guide.anchor}
                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                              >
                                Fix {guide.fieldLabel} <ArrowRight className="h-3 w-3" />
                              </Link>
                            )}
                            {guide.autoFixable && (
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                auto-fixable
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {canAutoFix && (
                <button
                  onClick={() => previewFixes.mutate()}
                  disabled={previewFixes.isPending || applyFixes.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {previewFixes.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  Preview &amp; apply suggested fixes
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                You’ll see a field-by-field diff to review before anything is saved. Non-auto-fixable
                items link to the exact editor field to fix by hand.
              </p>
            </div>
          </td>
        </tr>
      )}

      <FixPreviewDialog
        preview={preview}
        onCancel={() => setPreview(null)}
        onConfirm={() => applyFixes.mutate()}
        applying={applyFixes.isPending}
      />
    </>
  );
}

function DiffValue({ text, tone }: { text: string; tone: "from" | "to" }) {
  const empty = !text.trim();
  return (
    <div
      className={`rounded-md border px-2.5 py-1.5 text-xs ${
        tone === "to"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted/40 text-muted-foreground line-through decoration-destructive/50"
      }`}
    >
      {empty ? <span className="italic opacity-70">empty</span> : text}
    </div>
  );
}

function FixPreviewDialog({
  preview,
  onCancel,
  onConfirm,
  applying,
}: {
  preview: PreviewFixesResult | null;
  onCancel: () => void;
  onConfirm: () => void;
  applying: boolean;
}) {
  const open = !!preview;
  const delta = preview ? preview.projectedScore - preview.scoreBefore : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !applying && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" /> Review suggested fixes
          </DialogTitle>
          <DialogDescription>
            These AI changes are not saved yet. Review the field-by-field diff below, then apply or
            cancel.
          </DialogDescription>
        </DialogHeader>

        {preview && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
              <span className="text-muted-foreground">Projected score</span>
              <span className={`font-display text-lg font-bold ${scoreTone(preview.scoreBefore)}`}>
                {preview.scoreBefore}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className={`font-display text-lg font-bold ${scoreTone(preview.projectedScore)}`}>
                {preview.projectedScore}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                grade {preview.projectedGrade}
              </span>
              {delta !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    delta > 0 ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {preview.appliedFields.map((f) => (
                <div key={f.field} className="rounded-xl border border-border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </p>
                  <div className="grid gap-2">
                    <DiffValue text={f.from} tone="from" />
                    <DiffValue text={f.to} tone="to" />
                  </div>
                </div>
              ))}
            </div>

            {preview.remainingIssues.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {preview.remainingIssues.length} issue
                {preview.remainingIssues.length === 1 ? "" : "s"} will remain and need manual edits.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <button
            onClick={onCancel}
            disabled={applying}
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={applying}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Apply {preview?.fixedCount ?? 0} fix
            {(preview?.fixedCount ?? 0) === 1 ? "" : "es"} &amp; re-audit
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

type SmartView = "all" | "critical" | "warning" | "needswork" | "clean";

function matchesView(row: SeoAuditRow, view: SmartView): boolean {
  const hasCritical = row.issues.some((i) => i.severity === "critical");
  const hasWarning = row.issues.some((i) => i.severity === "warning");
  switch (view) {
    case "critical":
      return hasCritical;
    case "warning":
      return hasWarning;
    case "needswork":
      return row.score < 80;
    case "clean":
      return row.issues.length === 0;
    default:
      return true;
  }
}

export function AuditDashboard() {
  const qc = useQueryClient();
  const runFn = useServerFn(runBulkSeoAudit);
  const listRunsFn = useServerFn(listSeoRuns);
  const overviewFn = useServerFn(getAuditOverview);
  const getSettingsFn = useServerFn(getSeoSettings);
  const saveSettingsFn = useServerFn(saveSeoSettings);
  const pendingFn = useServerFn(getPendingAuditCount);

  const [selectedRun, setSelectedRun] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<SmartView>("all");

  const runs = useQuery({ queryKey: ["seo-runs"], queryFn: () => listRunsFn() });
  const overview = useQuery({
    queryKey: ["seo-overview", selectedRun ?? "latest"],
    queryFn: () => overviewFn({ data: { runId: selectedRun } }),
  });
  const settings = useQuery({ queryKey: ["seo-settings"], queryFn: () => getSettingsFn() });
  const pending = useQuery({ queryKey: ["seo-pending"], queryFn: () => pendingFn() });

  const runAudit = useMutation({
    mutationFn: () => runFn(),
    onMutate: () => setError(null),
    onSuccess: () => {
      setSelectedRun(undefined);
      qc.invalidateQueries({ queryKey: ["seo-runs"] });
      qc.invalidateQueries({ queryKey: ["seo-overview"] });
      qc.invalidateQueries({ queryKey: ["seo-pending"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Audit failed"),
  });

  const toggleSchedule = useMutation({
    mutationFn: (enabled: boolean) => saveSettingsFn({ data: { scheduleEnabled: enabled } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo-settings"] }),
  });

  const run = overview.data?.run ?? null;
  const audits = overview.data?.audits ?? [];

  const counts = {
    all: audits.length,
    critical: audits.filter((a) => a.issues.some((i) => i.severity === "critical")).length,
    warning: audits.filter((a) => a.issues.some((i) => i.severity === "warning")).length,
    needswork: audits.filter((a) => a.score < 80).length,
    clean: audits.filter((a) => a.issues.length === 0).length,
  };
  const totalCritical = audits.reduce(
    (n, a) => n + a.issues.filter((i) => i.severity === "critical").length,
    0,
  );
  const totalWarning = audits.reduce(
    (n, a) => n + a.issues.filter((i) => i.severity === "warning").length,
    0,
  );
  const filtered = audits.filter((a) => matchesView(a, view));
  const pendingCount = pending.data?.count ?? 0;

  const views: { id: SmartView; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "all", label: "All posts", icon: <ListChecks className="h-4 w-4" />, count: counts.all },
    { id: "critical", label: "Critical", icon: <Flame className="h-4 w-4" />, count: counts.critical },
    { id: "warning", label: "Warnings", icon: <AlertTriangle className="h-4 w-4" />, count: counts.warning },
    { id: "needswork", label: "Needs work", icon: <ShieldAlert className="h-4 w-4" />, count: counts.needswork },
    { id: "clean", label: "Clean", icon: <CheckCircle2 className="h-4 w-4" />, count: counts.clean },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Bulk SEO audit</h2>
          <p className="text-sm text-muted-foreground">
            Score every published post and track how it changes run over run.
          </p>
        </div>
        <button
          onClick={() => runAudit.mutate()}
          disabled={runAudit.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {runAudit.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run audit now
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Posts changed since last audit — auto-flagged by the publish/update trigger */}
      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {pendingCount} post{pendingCount === 1 ? "" : "s"} changed since the last audit
              </p>
              <p className="text-xs text-muted-foreground">
                New and edited posts are auto-flagged and will be re-scored on the next run.
              </p>
            </div>
          </div>
          <button
            onClick={() => runAudit.mutate()}
            disabled={runAudit.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/15 px-3 py-1.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-500/25 disabled:opacity-60 dark:text-amber-300"
          >
            {runAudit.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Re-audit now
          </button>
        </div>
      )}

      {/* Schedule toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Scheduled daily audit</p>
            <p className="text-xs text-muted-foreground">
              Automatically re-audit every published post once a day.
            </p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={!!settings.data?.scheduleEnabled}
          disabled={toggleSchedule.isPending || settings.isLoading}
          onClick={() => toggleSchedule.mutate(!settings.data?.scheduleEnabled)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${settings.data?.scheduleEnabled ? "bg-primary" : "bg-muted"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${settings.data?.scheduleEnabled ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Gauge className="h-4 w-4" />}
          label="Average score"
          value={
            run ? (
              <span className={scoreTone(run.avg_score ?? 0)}>{run.avg_score ?? 0}</span>
            ) : (
              "—"
            )
          }
          sub={
            run ? (
              <Delta current={run.avg_score ?? 0} previous={run.prev_avg_score} />
            ) : (
              "no runs yet"
            )
          }
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Posts audited"
          value={run ? run.total_posts : "—"}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Open SEO issues"
          value={totalCritical + totalWarning}
          sub={
            <span>
              <span className="font-semibold text-destructive">{totalCritical} critical</span> ·{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {totalWarning} warnings
              </span>
            </span>
          }
        />
        <StatCard
          icon={<CalendarClock className="h-4 w-4" />}
          label="Last run"
          value={
            run ? (
              <span className="text-base">
                {new Date(run.created_at).toLocaleDateString()}
              </span>
            ) : (
              "—"
            )
          }
          sub={run ? `${run.trigger} run` : undefined}
        />
      </div>

      {/* Run selector */}
      {(runs.data?.length ?? 0) > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Viewing run:</label>
          <select
            value={selectedRun ?? (run?.id ?? "")}
            onChange={(e) => setSelectedRun(e.target.value || undefined)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
          >
            {runs.data!.map((r) => (
              <option key={r.id} value={r.id}>
                {new Date(r.created_at).toLocaleString()} · avg {r.avg_score ?? 0} · {r.trigger}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Smart views — filter by severity across all posts in this run */}
      {run && audits.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === v.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.icon}
              {v.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  view === v.id ? "bg-primary-foreground/20" : "bg-secondary"
                }`}
              >
                {v.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results table */}
      <div className="rounded-2xl border border-border bg-card">
        {overview.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !run ? (
          <div className="px-6 py-16 text-center">
            <Gauge className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No audits yet</p>
            <p className="text-sm text-muted-foreground">
              Run your first audit to score every published post.
            </p>
          </div>
        ) : audits.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No published posts were found in this run.
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/60" />
            <p className="mt-3 text-sm font-medium">Nothing in this view</p>
            <p className="text-sm text-muted-foreground">
              No posts match the “{views.find((v) => v.id === view)?.label}” filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pr-3 text-left font-medium">Post</th>
                  <th className="px-3 py-3 text-center font-medium">Score</th>
                  <th className="px-3 py-3 text-center font-medium">Grade</th>
                  <th className="px-3 py-3 text-center font-medium">Change</th>
                  <th className="px-3 py-3 text-center font-medium">Issues</th>
                  <th className="pl-3 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <AuditRow key={a.id} row={a} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
