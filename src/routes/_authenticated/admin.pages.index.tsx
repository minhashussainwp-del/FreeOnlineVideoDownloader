import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileSliders } from "lucide-react";
import { PAGE_DEFS } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/pages/")({
  component: AdminPages,
});

function AdminPages() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Site pages</h1>
        <p className="text-sm text-muted-foreground">
          Edit the homepage, company &amp; legal pages, and site branding. Blank fields keep the
          built-in text.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAGE_DEFS.map((p) => (
          <Link
            key={p.key}
            to="/admin/pages/$key"
            params={{ key: p.key }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/50 hover:bg-secondary/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FileSliders className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{p.label}</p>
              <p className="truncate text-xs text-muted-foreground">{p.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
