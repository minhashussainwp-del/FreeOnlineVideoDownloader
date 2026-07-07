import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Scheduled bulk SEO audit endpoint. Called by pg_cron. Secured with the
// Supabase anon key via the `apikey` header, and only runs when the admin has
// enabled scheduled audits in the SEO dashboard.
export const Route = createFileRoute("/api/public/hooks/seo-audit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!apikey || !expected || apikey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Only run if scheduled audits are enabled.
        const { data: settings } = await supabaseAdmin
          .from("site_content")
          .select("content")
          .eq("key", "seo_settings")
          .maybeSingle();
        const enabled = !!(settings?.content as { scheduleEnabled?: boolean } | null)?.scheduleEnabled;
        if (!enabled) {
          return new Response(JSON.stringify({ skipped: true, reason: "schedule disabled" }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { performBulkAudit } = await import("@/lib/seo-audit.server");
          const summary = await performBulkAudit(supabaseAdmin, {
            trigger: "scheduled",
            createdBy: null,
          });
          return new Response(JSON.stringify({ ok: true, ...summary }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Audit failed";
          console.error("Scheduled SEO audit failed:", message);
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
