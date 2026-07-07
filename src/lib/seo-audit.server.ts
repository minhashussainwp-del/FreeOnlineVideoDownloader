// Server-only: the actual bulk SEO audit engine. Shared by the admin server
// function (runs as the signed-in admin) and the scheduled hook (runs with the
// service-role client). Keep out of the client bundle — server-only imports.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  auditPost,
  gradeFor,
  type AuditablePost,
  type SeoIssue,
} from "@/lib/seo-audit";
import { slugify } from "@/lib/blog-utils";

type AnyClient = SupabaseClient<Database>;

export type BulkAuditSummary = {
  runId: string;
  totalPosts: number;
  avgScore: number;
  prevAvgScore: number | null;
};

export async function performBulkAudit(
  supabase: AnyClient,
  opts: { trigger: "manual" | "scheduled"; createdBy?: string | null },
): Promise<BulkAuditSummary> {
  // 1. Load all published posts.
  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, content, featured_image, category, tags, meta_title, meta_description",
    )
    .eq("status", "published");
  if (postsErr) throw new Error(postsErr.message);

  const list = posts ?? [];

  // 2. Pull the previous run to compute per-post + average deltas.
  const { data: prevRun } = await supabase
    .from("seo_audit_runs")
    .select("id, avg_score")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevScoreByPost = new Map<string, number>();
  if (prevRun?.id) {
    const { data: prevAudits } = await supabase
      .from("seo_audits")
      .select("post_id, score")
      .eq("run_id", prevRun.id);
    for (const a of prevAudits ?? []) {
      if (a.post_id) prevScoreByPost.set(a.post_id, a.score);
    }
  }

  // 3. Score each post.
  const scored = list.map((p) => {
    const result = auditPost(p as AuditablePost);
    return {
      post_id: p.id,
      post_title: p.title,
      post_slug: p.slug,
      score: result.score,
      grade: result.grade,
      issues: result.issues,
      previous_score: prevScoreByPost.has(p.id) ? prevScoreByPost.get(p.id)! : null,
    };
  });

  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((s, x) => s + x.score, 0) / scored.length)
      : 0;

  // 4. Create the run.
  const { data: run, error: runErr } = await supabase
    .from("seo_audit_runs")
    .insert({
      status: "completed",
      trigger: opts.trigger,
      total_posts: scored.length,
      avg_score: avgScore,
      prev_avg_score: prevRun?.avg_score ?? null,
      created_by: opts.createdBy ?? null,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (runErr) throw new Error(runErr.message);

  // 5. Insert per-post audit rows.
  if (scored.length > 0) {
    const rows = scored.map((s) => ({
      run_id: run.id,
      post_id: s.post_id,
      post_title: s.post_title,
      post_slug: s.post_slug,
      score: s.score,
      previous_score: s.previous_score,
      grade: s.grade,
      issues: s.issues as unknown as Database["public"]["Tables"]["seo_audits"]["Insert"]["issues"],
    }));
    const { error: auditErr } = await supabase.from("seo_audits").insert(rows);
    if (auditErr) throw new Error(auditErr.message);
  }

  // 6. Clear the "needs audit" flag on every post we just scored, so freshly
  // published / edited posts stop showing as pending until they change again.
  if (list.length > 0) {
    await supabase
      .from("posts")
      .update({ seo_audit_pending: false, seo_audited_at: new Date().toISOString() })
      .in("id", list.map((p) => p.id));
  }

  return {
    runId: run.id,
    totalPosts: scored.length,
    avgScore,
    prevAvgScore: prevRun?.avg_score ?? null,
  };
}

export { gradeFor };

// ---------------------------------------------------------------------------
// One-click "Apply suggested fixes" for a single post.
// Generates SEO-optimised meta fields with the AI gateway, writes them back to
// the post, then re-scores the post and syncs the audit row so the dashboard
// verifies the improvement immediately.
// ---------------------------------------------------------------------------

const POST_FIELDS =
  "id, title, slug, excerpt, content, featured_image, category, tags, meta_title, meta_description";

export type AppliedField = {
  field: string;
  label: string;
  from: string;
  to: string;
};

export type ProposedFields = {
  meta_title?: string;
  meta_description?: string;
  title?: string;
  excerpt?: string;
  slug?: string;
  tags?: string[];
};

export type ApplyFixesResult = {
  postId: string;
  scoreBefore: number;
  scoreAfter: number;
  gradeAfter: string;
  appliedFields: AppliedField[];
  remainingIssues: SeoIssue[];
  /** Auto-fixable issues that were addressed. */
  fixedCount: number;
};

export type PreviewFixesResult = {
  postId: string;
  scoreBefore: number;
  /** Projected score if the proposed changes are applied. */
  projectedScore: number;
  projectedGrade: string;
  appliedFields: AppliedField[];
  remainingIssues: SeoIssue[];
  fixedCount: number;
  /** The concrete values to persist if the admin confirms. */
  proposal: ProposedFields;
};


function firstJsonObject(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```[a-zA-Z]*\s*/g, "")
    .replace(/\s*```\s*$/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI returned an unexpected response");
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

async function generateSeoMeta(
  lovableKey: string,
  post: AuditablePost,
): Promise<ProposedFields> {
  const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
  const { generateText } = await import("ai");

  const provider = createLovableAiGatewayProvider(lovableKey);
  const model = provider("google/gemini-2.5-flash");

  const plain = (post.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);

  const system = `You are an expert SEO copywriter. Improve on-page SEO metadata for a blog post.
Return ONLY a compact JSON object (no markdown fences, no commentary) with these keys:
- "meta_title": 30-60 characters, keyword-first, compelling.
- "meta_description": 120-160 characters, includes the main keyword and a value proposition.
- "title": 20-70 characters, descriptive H1-style title.
- "excerpt": 40-160 characters, a natural teaser sentence.
- "slug": lowercase, hyphenated, no stop-word clutter, under 60 characters.
- "tags": array of 3-6 short lowercase topical tags.
Base everything on the post's actual topic. Never leave a field empty.`;

  const prompt = `Existing title: ${post.title || "(none)"}
Existing meta title: ${post.meta_title || "(none)"}
Existing meta description: ${post.meta_description || "(none)"}
Existing slug: ${post.slug || "(none)"}
Existing tags: ${(post.tags || []).join(", ") || "(none)"}

Article content:
${plain || "(no body content)"}`;

  const { text } = await generateText({ model, system, prompt });
  const json = firstJsonObject(text);

  const asString = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const tags = Array.isArray(json.tags)
    ? json.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 6)
    : undefined;

  return {
    meta_title: asString(json.meta_title) || undefined,
    meta_description: asString(json.meta_description) || undefined,
    title: asString(json.title) || undefined,
    excerpt: asString(json.excerpt) || undefined,
    slug: asString(json.slug) ? slugify(asString(json.slug)) : undefined,
    tags: tags && tags.length ? tags : undefined,
  };
}

// Figure out which auto-fixable fields are currently failing for a post.
function wantedFields(before: { issues: SeoIssue[] }) {
  const failingIds = new Set(before.issues.map((i) => i.id));
  return {
    meta_title: failingIds.has("meta_title"),
    meta_description: failingIds.has("meta_description"),
    title: failingIds.has("title"),
    excerpt: failingIds.has("excerpt"),
    slug: failingIds.has("slug"),
    tags: failingIds.has("tags"),
    any:
      failingIds.has("meta_title") ||
      failingIds.has("meta_description") ||
      failingIds.has("title") ||
      failingIds.has("excerpt") ||
      failingIds.has("slug") ||
      failingIds.has("tags"),
  };
}

// Build the DB patch + human-readable field diffs from a proposal, limited to
// the fields whose issues are actually failing.
function buildPatch(
  current: AuditablePost,
  proposal: ProposedFields,
  want: ReturnType<typeof wantedFields>,
) {
  const patch: Database["public"]["Tables"]["posts"]["Update"] = {};
  const applied: AppliedField[] = [];
  const record = (field: string, label: string, from: string | null, to: string) => {
    applied.push({ field, label, from: from ?? "", to });
  };

  if (want.meta_title && proposal.meta_title) {
    patch.meta_title = proposal.meta_title;
    record("meta_title", "Meta title", current.meta_title, proposal.meta_title);
  }
  if (want.meta_description && proposal.meta_description) {
    patch.meta_description = proposal.meta_description;
    record("meta_description", "Meta description", current.meta_description, proposal.meta_description);
  }
  if (want.title && proposal.title) {
    patch.title = proposal.title;
    record("title", "Post title", current.title, proposal.title);
  }
  if (want.excerpt && proposal.excerpt) {
    patch.excerpt = proposal.excerpt;
    record("excerpt", "Excerpt", current.excerpt, proposal.excerpt);
  }
  if (want.slug && proposal.slug) {
    patch.slug = slugify(proposal.slug);
    record("slug", "URL slug", current.slug, patch.slug as string);
  }
  if (want.tags && proposal.tags && proposal.tags.length) {
    patch.tags = proposal.tags;
    record("tags", "Tags", (current.tags || []).join(", "), proposal.tags.join(", "));
  }

  return { patch, applied };
}

function mergeForAudit(
  current: AuditablePost,
  patch: Database["public"]["Tables"]["posts"]["Update"],
): AuditablePost {
  return {
    ...current,
    ...(patch.meta_title !== undefined ? { meta_title: patch.meta_title } : {}),
    ...(patch.meta_description !== undefined ? { meta_description: patch.meta_description } : {}),
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
    ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
    ...(patch.tags !== undefined ? { tags: patch.tags as string[] } : {}),
  };
}

// Generate a proposal and return the field-by-field diffs WITHOUT persisting
// anything. Backs the confirmation preview so the admin can review or cancel.
export async function previewPostFixes(
  supabase: AnyClient,
  opts: { postId: string; lovableKey: string },
): Promise<PreviewFixesResult> {
  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select(POST_FIELDS)
    .eq("id", opts.postId)
    .maybeSingle();
  if (postErr) throw new Error(postErr.message);
  if (!post) throw new Error("Post not found");

  const current = post as unknown as AuditablePost & { id: string };
  const before = auditPost(current);
  const want = wantedFields(before);

  if (!want.any) {
    return {
      postId: opts.postId,
      scoreBefore: before.score,
      projectedScore: before.score,
      projectedGrade: before.grade,
      appliedFields: [],
      remainingIssues: before.issues,
      fixedCount: 0,
      proposal: {},
    };
  }

  const suggestion = await generateSeoMeta(opts.lovableKey, current);
  const { patch, applied } = buildPatch(current, suggestion, want);
  const projected = auditPost(mergeForAudit(current, patch));

  // Only surface the fields we actually intend to change.
  const proposal: ProposedFields = {};
  if (patch.meta_title !== undefined) proposal.meta_title = patch.meta_title as string;
  if (patch.meta_description !== undefined)
    proposal.meta_description = patch.meta_description as string;
  if (patch.title !== undefined) proposal.title = patch.title as string;
  if (patch.excerpt !== undefined) proposal.excerpt = patch.excerpt as string;
  if (patch.slug !== undefined) proposal.slug = patch.slug as string;
  if (patch.tags !== undefined) proposal.tags = patch.tags as string[];

  return {
    postId: opts.postId,
    scoreBefore: before.score,
    projectedScore: projected.score,
    projectedGrade: projected.grade,
    appliedFields: applied,
    remainingIssues: projected.issues,
    fixedCount: applied.length,
    proposal,
  };
}

export async function applyAndRescorePost(
  supabase: AnyClient,
  opts: {
    postId: string;
    auditId?: string;
    lovableKey: string;
    userId?: string | null;
    /** Reviewed values from the confirmation preview. When present, these are
     *  applied verbatim instead of generating fresh suggestions. */
    proposal?: ProposedFields;
  },
): Promise<ApplyFixesResult> {
  // 1. Load the post.
  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select(POST_FIELDS)
    .eq("id", opts.postId)
    .maybeSingle();
  if (postErr) throw new Error(postErr.message);
  if (!post) throw new Error("Post not found");

  const current = post as unknown as AuditablePost & { id: string };
  const before = auditPost(current);
  const want = wantedFields(before);

  if (!want.any) {
    return {
      postId: opts.postId,
      scoreBefore: before.score,
      scoreAfter: before.score,
      gradeAfter: before.grade,
      appliedFields: [],
      remainingIssues: before.issues,
      fixedCount: 0,
    };
  }

  // 2. Use the reviewed proposal if supplied, otherwise generate fresh.
  const suggestion =
    opts.proposal && Object.keys(opts.proposal).length > 0
      ? opts.proposal
      : await generateSeoMeta(opts.lovableKey, current);

  const { patch, applied } = buildPatch(current, suggestion, want);

  if (applied.length === 0) {
    return {
      postId: opts.postId,
      scoreBefore: before.score,
      scoreAfter: before.score,
      gradeAfter: before.grade,
      appliedFields: [],
      remainingIssues: before.issues,
      fixedCount: 0,
    };
  }

  // 3. Persist the fixes. Clear the pending flag since we just re-scored it.
  const { error: updErr } = await supabase
    .from("posts")
    .update({ ...patch, seo_audit_pending: false, seo_audited_at: new Date().toISOString() })
    .eq("id", opts.postId);
  if (updErr) throw new Error(updErr.message);

  // 4. Re-audit the post for verification.
  const after = auditPost(mergeForAudit(current, patch));

  // 5. Sync the audit row so the dashboard verifies the improvement. Keep the
  //    fix delta visible by pointing previous_score at the pre-fix score.
  if (opts.auditId) {
    await supabase
      .from("seo_audits")
      .update({
        score: after.score,
        grade: after.grade,
        previous_score: before.score,
        post_title: mergeForAudit(current, patch).title,
        post_slug: mergeForAudit(current, patch).slug,
        issues: after.issues as unknown as Database["public"]["Tables"]["seo_audits"]["Update"]["issues"],
      })
      .eq("id", opts.auditId);

    // 6. Recompute the run's average so the summary stays accurate.
    const { data: auditRow } = await supabase
      .from("seo_audits")
      .select("run_id")
      .eq("id", opts.auditId)
      .maybeSingle();
    if (auditRow?.run_id) {
      const { data: rows } = await supabase
        .from("seo_audits")
        .select("score")
        .eq("run_id", auditRow.run_id);
      if (rows && rows.length) {
        const avg = Math.round(rows.reduce((s, r) => s + (r.score ?? 0), 0) / rows.length);
        await supabase.from("seo_audit_runs").update({ avg_score: avg }).eq("id", auditRow.run_id);
      }
    }
  }

  return {
    postId: opts.postId,
    scoreBefore: before.score,
    scoreAfter: after.score,
    gradeAfter: after.grade,
    appliedFields: applied,
    remainingIssues: after.issues,
    fixedCount: applied.length,
  };
}
