import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, FileCode2 } from "lucide-react";
import { AuditDashboard } from "@/components/seo/audit-dashboard";
import { RobotsSitemapEditor } from "@/components/seo/robots-sitemap-editor";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoPage,
});

type Tab = "audit" | "resources";

function SeoPage() {
  const [tab, setTab] = useState<Tab>("audit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">SEO Center</h1>
        <p className="text-sm text-muted-foreground">
          Run bulk SEO audits, track score changes, and manage robots.txt &amp; sitemap.xml with AI.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setTab("audit")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "audit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Gauge className="h-4 w-4" /> Bulk audit
        </button>
        <button
          onClick={() => setTab("resources")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "resources" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCode2 className="h-4 w-4" /> Robots &amp; Sitemap
        </button>
      </div>

      {tab === "audit" ? <AuditDashboard /> : <RobotsSitemapEditor />}
    </div>
  );
}
