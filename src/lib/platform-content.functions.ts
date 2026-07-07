import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateText } from "ai";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPlatform } from "@/lib/platforms";
import { buildFallbackArticle, normalizeArticle, type RichPlatformArticle } from "@/lib/platform-article";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}

// ---------- Public read ----------

export const getPublishedPlatformContent = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(60) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("platform_content")
      .select("content, status")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row?.content ?? null;
  });

// ---------- Admin reads ----------

export const listPlatformContentAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("platform_content")
      .select("slug, status, updated_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPlatformContentAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const platform = getPlatform(data.slug);
    if (!platform) throw new Error("Unknown platform");
    const { data: row, error } = await context.supabase
      .from("platform_content")
      .select("content, status, author_name")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const article = normalizeArticle(platform, row?.content ?? null);
    return {
      slug: data.slug,
      status: (row?.status as "draft" | "published") ?? "draft",
      exists: !!row,
      article,
    };
  });

// ---------- Admin write ----------

const savePayload = z.object({
  slug: z.string().min(1).max(60),
  status: z.enum(["draft", "published"]).default("draft"),
  content: z.record(z.string(), z.unknown()),
});

export const savePlatformContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => savePayload.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const platform = getPlatform(data.slug);
    if (!platform) throw new Error("Unknown platform");

    // Normalise so partial content is always complete and safe.
    const normalized = normalizeArticle(platform, data.content);

    const { error } = await context.supabase
      .from("platform_content")
      .upsert(
        {
          slug: data.slug,
          content: normalized as unknown as Database["public"]["Tables"]["platform_content"]["Insert"]["content"],
          status: data.status,
          author_name: normalized.authorName,
          updated_by: context.userId,
        },
        { onConflict: "slug" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- AI generation ----------

export const generatePlatformContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }): Promise<RichPlatformArticle> => {
    await assertAdmin(context);
    const platform = getPlatform(data.slug);
    if (!platform) throw new Error("Unknown platform");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const shape = `{
  "answer": "one-sentence AEO answer (max ~45 words)",
  "lastUpdated": "Month YYYY",
  "authorName": "Editorial Team",
  "intro": ["2 short paragraphs"],
  "benefits": [{ "title": "", "text": "" }],
  "howToGeneral": [{ "title": "", "text": "" }],
  "androidSteps": ["3-4 short steps"],
  "iphoneSteps": ["3-4 short steps"],
  "pcSteps": ["3-4 short steps"],
  "formats": "one paragraph on formats & quality",
  "useCases": ["4-6 short bullets"],
  "safety": ["4-6 safety/legal bullets"],
  "troubleshooting": ["5-7 reasons a download fails"],
  "comparison": [{ "feature": "", "online": "", "app": "" }],
  "alternatives": "one paragraph, unbiased",
  "quickAnswers": [{ "q": "", "a": "" }],
  "faqs": [{ "q": "", "a": "" }],
  "keywords": ["6-8 SEO keywords"]
}`;

    const system = `You are an expert SEO content writer for a free online video downloader tool called "Free Online Video Downloader".
Write in 100% clear, simple English (grade 6-8 reading level), short sentences, no fluff, no keyword stuffing.
Compliance rules you MUST follow:
- Only mention downloading content the user owns, public content, or content they have permission to save.
- Never claim "100% safe guaranteed", "official downloader", "unlimited forever", fake statistics, or fake user counts.
- Never use the words hack, bypass, or crack.
- For YouTube, note its Terms of Service only allow downloads with creator permission or copyright-free content.
- Mention DMCA-protected content should not be downloaded, and that bot protection/CAPTCHA can block downloads.
Return ONLY valid minified JSON matching the requested shape. No markdown, no commentary.`;

    const prompt = `Write the tool-page article for the ${platform.name} video downloader.
Platform slug: ${platform.slug}. Supports audio/MP3: ${platform.audio ? "yes" : "no"}.
Platform description: ${platform.description}
Provide 10 FAQs, 8-10 quickAnswers, and 4 benefits.
Return JSON exactly in this shape:
${shape}`;

    let raw = "";
    try {
      const result = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt,
      });
      raw = result.text ?? "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI request failed";
      if (message.includes("429")) throw new Error("AI rate limit reached — please try again in a moment.");
      if (message.includes("402")) throw new Error("AI credits exhausted — add credits to continue generating.");
      throw new Error(`AI generation failed: ${message}`);
    }

    const parsed = extractJson(raw);
    if (!parsed) {
      // Degrade gracefully rather than crash.
      return buildFallbackArticle(platform);
    }
    return normalizeArticle(platform, parsed);
  });

function extractJson(text: string): unknown | null {
  const trimmed = text.trim();
  const fenced = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = fenced.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}
