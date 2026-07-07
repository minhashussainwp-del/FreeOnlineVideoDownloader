import { createServerFn } from "@tanstack/react-start";
import { type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SeoIssue } from "@/lib/seo-audit";

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}

const SETTINGS_KEY = "seo_settings";

// ------------------- Bulk audit -------------------

export type SeoRun = {
  id: string;
  status: string;
  trigger: string;
  total_posts: number;
  avg_score: number | null;
  prev_avg_score: number | null;
  created_at: string;
};

export type SeoAuditRow = {
  id: string;
  post_id: string | null;
  post_title: string | null;
  post_slug: string | null;
  score: number;
  previous_score: number | null;
  grade: string | null;
  issues: SeoIssue[];
};

export type AuditOverview = {
  run: SeoRun | null;
  audits: SeoAuditRow[];
};

export type PendingAudit = {
  count: number;
  posts: { id: string; title: string | null; slug: string | null }[];
};

// How many published posts have changed since the last audit and are waiting
// to be re-scored on the next dashboard run.
export const getPendingAuditCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PendingAudit> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("posts")
      .select("id, title, slug")
      .eq("status", "published")
      .eq("seo_audit_pending", true)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const posts = data ?? [];
    return { count: posts.length, posts };
  });

export const runBulkSeoAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ runId: string; totalPosts: number; avgScore: number; prevAvgScore: number | null }> => {
    await assertAdmin(context);
    const { performBulkAudit } = await import("@/lib/seo-audit.server");
    return performBulkAudit(context.supabase, { trigger: "manual", createdBy: context.userId });
  });

// One-click "Apply suggested fixes" for a single post: AI-optimise the meta
// fields, write them back, then re-score and sync the audit row for verification.
export type ApplyFixesResult = {
  postId: string;
  scoreBefore: number;
  scoreAfter: number;
  gradeAfter: string;
  appliedFields: { field: string; label: string; from: string; to: string }[];
  remainingIssues: SeoIssue[];
  fixedCount: number;
};

export type ProposedFields = {
  meta_title?: string;
  meta_description?: string;
  title?: string;
  excerpt?: string;
  slug?: string;
  tags?: string[];
};

export type PreviewFixesResult = {
  postId: string;
  scoreBefore: number;
  projectedScore: number;
  projectedGrade: string;
  appliedFields: { field: string; label: string; from: string; to: string }[];
  remainingIssues: SeoIssue[];
  fixedCount: number;
  proposal: ProposedFields;
};

const proposalSchema = z
  .object({
    meta_title: z.string().max(320).optional(),
    meta_description: z.string().max(500).optional(),
    title: z.string().max(300).optional(),
    excerpt: z.string().max(1000).optional(),
    slug: z.string().max(200).optional(),
    tags: z.array(z.string().max(60)).max(12).optional(),
  })
  .optional();

// Preview the AI-suggested fixes as field-by-field diffs WITHOUT applying them,
// so the admin can review or cancel before anything is written.
export const previewPostSeoFixes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string }) =>
    z.object({ postId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<PreviewFixesResult> => {
    await assertAdmin(context);
    const lovableKey = process.env.LOVABLE_API_KEY;
    if (!lovableKey) throw new Error("AI is not configured on this project.");
    const { previewPostFixes } = await import("@/lib/seo-audit.server");
    return previewPostFixes(context.supabase, { postId: data.postId, lovableKey });
  });

export const applyPostSeoFixes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string; auditId?: string; proposal?: ProposedFields }) =>
    z
      .object({
        postId: z.string().uuid(),
        auditId: z.string().uuid().optional(),
        proposal: proposalSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ApplyFixesResult> => {
    await assertAdmin(context);
    const lovableKey = process.env.LOVABLE_API_KEY;
    if (!lovableKey) throw new Error("AI is not configured on this project.");
    const { applyAndRescorePost } = await import("@/lib/seo-audit.server");
    return applyAndRescorePost(context.supabase, {
      postId: data.postId,
      auditId: data.auditId,
      proposal: data.proposal,
      lovableKey,
      userId: context.userId,
    });
  });

export const listSeoRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SeoRun[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("seo_audit_runs")
      .select("id, status, trigger, total_posts, avg_score, prev_avg_score, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as SeoRun[];
  });

export const getAuditOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { runId?: string }) =>
    z.object({ runId: z.string().uuid().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }): Promise<AuditOverview> => {
    await assertAdmin(context);

    let run: SeoRun | null = null;
    if (data.runId) {
      const { data: r } = await context.supabase
        .from("seo_audit_runs")
        .select("id, status, trigger, total_posts, avg_score, prev_avg_score, created_at")
        .eq("id", data.runId)
        .maybeSingle();
      run = (r as SeoRun) ?? null;
    } else {
      const { data: r } = await context.supabase
        .from("seo_audit_runs")
        .select("id, status, trigger, total_posts, avg_score, prev_avg_score, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      run = (r as SeoRun) ?? null;
    }

    if (!run) return { run: null, audits: [] };

    const { data: audits, error } = await context.supabase
      .from("seo_audits")
      .select("id, post_id, post_title, post_slug, score, previous_score, grade, issues")
      .eq("run_id", run.id)
      .order("score", { ascending: true });
    if (error) throw new Error(error.message);

    return {
      run,
      audits: (audits ?? []).map((a) => ({
        ...a,
        issues: (a.issues as unknown as SeoIssue[]) ?? [],
      })),
    };
  });

// ------------------- Schedule setting -------------------

export type SeoSettings = { scheduleEnabled: boolean };

export const getSeoSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SeoSettings> => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("site_content")
      .select("content")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    const content = (data?.content as { scheduleEnabled?: boolean } | null) ?? null;
    return { scheduleEnabled: !!content?.scheduleEnabled };
  });

export const saveSeoSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { scheduleEnabled: boolean }) =>
    z.object({ scheduleEnabled: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<SeoSettings> => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("site_content").upsert(
      { key: SETTINGS_KEY, content: { scheduleEnabled: data.scheduleEnabled }, updated_by: context.userId },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { scheduleEnabled: data.scheduleEnabled };
  });

// ------------------- robots.txt / sitemap.xml -------------------

export type SeoResources = {
  robotsText: string;
  robotsIsCustom: boolean;
  robotsDefault: string;
  sitemapText: string;
  sitemapIsCustom: boolean;
  sitemapAuto: string;
};

export const getSeoResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SeoResources> => {
    await assertAdmin(context);
    const {
      ROBOTS_KEY,
      SITEMAP_KEY,
      defaultRobots,
      buildAutoSitemap,
      readContentOverride,
    } = await import("@/lib/seo-sitemap.server");

    const [robotsOverride, sitemapOverride, sitemapAuto] = await Promise.all([
      readContentOverride(ROBOTS_KEY),
      readContentOverride(SITEMAP_KEY),
      buildAutoSitemap(),
    ]);

    const robotsDefault = defaultRobots();
    return {
      robotsText: robotsOverride ?? robotsDefault,
      robotsIsCustom: robotsOverride !== null,
      robotsDefault,
      sitemapText: sitemapOverride ?? sitemapAuto,
      sitemapIsCustom: sitemapOverride !== null,
      sitemapAuto,
    };
  });

const saveResourceInput = z.object({
  kind: z.enum(["robots", "sitemap"]),
  // Empty string / null => remove override, revert to auto/default.
  text: z.string().max(200_000).nullable(),
});

export const saveSeoResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saveResourceInput.parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context);
    const { ROBOTS_KEY, SITEMAP_KEY } = await import("@/lib/seo-sitemap.server");
    const key = data.kind === "robots" ? ROBOTS_KEY : SITEMAP_KEY;
    const text = (data.text ?? "").trim();

    if (!text) {
      // Revert to auto/default by deleting any override row.
      const { error } = await context.supabase.from("site_content").delete().eq("key", key);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await context.supabase.from("site_content").upsert(
      { key, content: { text }, updated_by: context.userId },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------- AI generation -------------------

const genInput = z.object({
  kind: z.enum(["robots", "sitemap"]),
  instruction: z.string().trim().max(2000).optional().default(""),
});

export const generateSeoResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => genInput.parse(d))
  .handler(async ({ data, context }): Promise<{ text: string }> => {
    await assertAdmin(context);

    const lovableKey = process.env.LOVABLE_API_KEY;
    if (!lovableKey) throw new Error("AI is not configured on this project.");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { generateText } = await import("ai");
    const { SEO_BASE_URL, defaultRobots, buildAutoSitemap } = await import(
      "@/lib/seo-sitemap.server"
    );

    const provider = createLovableAiGatewayProvider(lovableKey);
    const model = provider("google/gemini-2.5-flash");

    let system: string;
    let context_text: string;
    if (data.kind === "robots") {
      system = `You are an SEO technical expert. Generate a production-ready robots.txt file for the website ${SEO_BASE_URL}.
Rules:
- Output ONLY the raw robots.txt content. No markdown fences, no commentary.
- Always allow crawling of public content and always include a Sitemap: line pointing to ${SEO_BASE_URL}/sitemap.xml.
- Block private/auth areas like /admin and /auth from indexing.
- Keep it valid and minimal.`;
      context_text = `Current robots.txt:\n${defaultRobots()}`;
    } else {
      const auto = await buildAutoSitemap();
      system = `You are an SEO technical expert. Produce a valid XML sitemap for ${SEO_BASE_URL}.
Rules:
- Output ONLY raw valid XML starting with <?xml. No markdown fences, no commentary.
- Use the sitemaps.org 0.9 schema (<urlset>). Absolute URLs only.
- Preserve all existing URLs unless the admin asks to remove them.`;
      context_text = `Current auto-generated sitemap.xml:\n${auto}`;
    }

    const prompt = `${context_text}\n\nAdmin instruction: ${data.instruction || "Improve and clean up this file following SEO best practices."}`;

    const { text } = await generateText({ model, system, prompt });

    // Strip accidental markdown fences.
    const cleaned = text
      .replace(/^```[a-zA-Z]*\s*/,"")
      .replace(/\s*```\s*$/,"")
      .trim();

    return { text: cleaned };
  });
