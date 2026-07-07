import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { slugify } from "@/lib/blog-utils";

type ChatBody = {
  messages?: unknown;
  providerId?: string;
  research?: boolean;
};

const SYSTEM_PROMPT = `You are an expert content writer AND an SEO specialist working inside a website's admin dashboard.
You help the admin research topics, write high-quality articles, and analyze & fix SEO problems.

WRITING:
- Write in clean Markdown: use ## and ### headings, short paragraphs, bullet lists, tables and bold where useful.
- Start articles with an H1 (#) title unless the user asks otherwise.
- When the user asks about current facts, statistics, prices, or news, USE web_search then read_url before writing. Cite sources.
- Be thorough like ChatGPT: outline, draft, refine, and answer follow-ups. Produce full, ready-to-publish articles.

SEO ANALYSIS & FIXING:
- The site's blog posts and pages are stored in the database. Their on-page SEO (title, meta title, meta description, slug, headings, alt text, internal links, content) can be READ and FIXED by you directly.
- Use list_site_posts to find posts, and audit_post to run a full on-page + technical SEO audit of a stored post (title/meta length, missing meta, H1 issues, thin content, images without alt text, internal linking, keyword usage).
- Use analyze_url to audit any LIVE URL (on-page + technical signals: title, meta description, canonical, Open Graph tags, robots, headings, images without alt, word count).
- When asked to FIX SEO, first audit, explain the concrete issues you found, propose exact improved values, then call apply_post_seo to write the fixes (meta_title, meta_description, slug, excerpt, tags, title, or improved content). Only change SEO-relevant things.
- Keep meta titles ~50-60 characters and meta descriptions ~150-160 characters; write compelling, keyword-relevant copy.
- Some technical SEO lives in the site's code (route metadata, robots.txt, sitemap.xml, canonical/OG defaults). You cannot edit source files yourself — for those, clearly identify the issue and the exact fix so the admin can ask the Lovable builder to apply it. For anything stored in the database, fix it yourself with apply_post_seo.`;

async function firecrawlSearch(apiKey: string, query: string, limit: number) {
  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) throw new Error(`Search failed [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { data?: { web?: unknown[] } | unknown[] };
  const list = Array.isArray(json.data) ? json.data : (json.data?.web ?? []);
  return (list as Array<{ title?: string; url?: string; description?: string }>).slice(0, limit).map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    snippet: r.description ?? "",
  }));
}

async function firecrawlScrape(apiKey: string, url: string) {
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  if (!res.ok) throw new Error(`Scrape failed [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as {
    data?: { markdown?: string; metadata?: { title?: string } };
    markdown?: string;
  };
  const markdown = json.data?.markdown ?? json.markdown ?? "";
  return { markdown: markdown.slice(0, 12000), title: json.data?.metadata?.title ?? "" };
}

async function firecrawlScrapeHtml(apiKey: string, url: string) {
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ url, formats: ["rawHtml", "markdown"], onlyMainContent: false }),
  });
  if (!res.ok) throw new Error(`Scrape failed [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as {
    data?: { rawHtml?: string; html?: string; markdown?: string };
    rawHtml?: string;
    html?: string;
    markdown?: string;
  };
  const html = json.data?.rawHtml ?? json.data?.html ?? json.rawHtml ?? json.html ?? "";
  const markdown = json.data?.markdown ?? json.markdown ?? "";
  return { html, markdown };
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? m[1].trim() : "";
}

/** Extract on-page + technical SEO signals from a full HTML document. */
function analyzeHtml(html: string, markdown: string) {
  const head = (html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html);
  const title = (head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();

  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const findMeta = (key: string, kind: "name" | "property") =>
    metaTags.find((t) => attr(t, kind).toLowerCase() === key.toLowerCase());
  const metaDescription = attr(findMeta("description", "name") ?? "", "content");
  const robots = attr(findMeta("robots", "name") ?? "", "content");
  const viewport = attr(findMeta("viewport", "name") ?? "", "content");
  const ogTitle = attr(findMeta("og:title", "property") ?? "", "content");
  const ogDescription = attr(findMeta("og:description", "property") ?? "", "content");
  const ogImage = attr(findMeta("og:image", "property") ?? "", "content");
  const twitterCard = attr(findMeta("twitter:card", "name") ?? "", "content");

  const canonicalTag = (html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0] ?? "");
  const canonical = attr(canonicalTag, "href");

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
  );
  const h2Count = (html.match(/<h2[\s>]/gi) ?? []).length;
  const h3Count = (html.match(/<h3[\s>]/gi) ?? []).length;

  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imagesMissingAlt = imgTags.filter((t) => !attr(t, "alt")).length;

  const langMatch = html.match(/<html[^>]*\blang\s*=\s*["']([^"']*)["']/i);
  const lang = langMatch ? langMatch[1] : "";

  const wordCount = markdown.replace(/[#>*`_\-\[\]()!]/g, " ").split(/\s+/).filter(Boolean).length;

  const issues: string[] = [];
  if (!title) issues.push("Missing <title> tag");
  else if (title.length < 30) issues.push(`Title is short (${title.length} chars; aim 50-60)`);
  else if (title.length > 65) issues.push(`Title is long (${title.length} chars; aim 50-60)`);
  if (!metaDescription) issues.push("Missing meta description");
  else if (metaDescription.length < 120) issues.push(`Meta description short (${metaDescription.length} chars; aim 150-160)`);
  else if (metaDescription.length > 170) issues.push(`Meta description long (${metaDescription.length} chars; aim 150-160)`);
  if (h1s.length === 0) issues.push("No H1 heading found");
  else if (h1s.length > 1) issues.push(`Multiple H1 headings (${h1s.length}); use exactly one`);
  if (!canonical) issues.push("Missing canonical link");
  if (!ogTitle || !ogDescription) issues.push("Missing Open Graph title/description");
  if (!ogImage) issues.push("Missing og:image for social sharing");
  if (!twitterCard) issues.push("Missing twitter:card");
  if (imagesMissingAlt > 0) issues.push(`${imagesMissingAlt} image(s) missing alt text`);
  if (!viewport) issues.push("Missing viewport meta (mobile)");
  if (!lang) issues.push("Missing <html lang> attribute");
  if (robots.toLowerCase().includes("noindex")) issues.push("Page is set to noindex");
  if (wordCount > 0 && wordCount < 300) issues.push(`Thin content (~${wordCount} words)`);

  return {
    title,
    titleLength: title.length,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    canonical,
    robots,
    lang,
    viewport,
    openGraph: { ogTitle, ogDescription, ogImage },
    twitterCard,
    h1s,
    h2Count,
    h3Count,
    imageCount: imgTags.length,
    imagesMissingAlt,
    wordCount,
    issues,
  };
}

/** Audit SEO signals from a stored post's HTML content + DB fields. */
function analyzePostContent(post: {
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  tags: string[] | null;
}) {
  const content = post.content ?? "";
  const h1s = (content.match(/<h1[\s>]/gi) ?? []).length;
  const h2Count = (content.match(/<h2[\s>]/gi) ?? []).length;
  const imgTags = content.match(/<img\b[^>]*>/gi) ?? [];
  const imagesMissingAlt = imgTags.filter((t) => !attr(t, "alt")).length;
  const internalLinks = (content.match(/<a\b[^>]*href\s*=\s*["'](?:\/|https?:\/\/[^"']*freevideodownloader)[^"']*["']/gi) ?? []).length;
  const wordCount = content.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").split(/\s+/).filter(Boolean).length;

  const metaTitle = post.meta_title ?? "";
  const metaDesc = post.meta_description ?? "";
  const issues: string[] = [];
  if (!metaTitle) issues.push("Missing meta title (falls back to post title)");
  else if (metaTitle.length < 30 || metaTitle.length > 65) issues.push(`Meta title length ${metaTitle.length} (aim 50-60)`);
  if (!metaDesc) issues.push("Missing meta description");
  else if (metaDesc.length < 120 || metaDesc.length > 170) issues.push(`Meta description length ${metaDesc.length} (aim 150-160)`);
  if (!post.excerpt) issues.push("Missing excerpt");
  if (!post.featured_image) issues.push("Missing featured image (used for social/og:image)");
  if (!post.tags || post.tags.length === 0) issues.push("No tags/keywords set");
  if (imagesMissingAlt > 0) issues.push(`${imagesMissingAlt} in-content image(s) missing alt text`);
  if (wordCount < 300) issues.push(`Thin content (~${wordCount} words; aim 600+)`);
  if (internalLinks === 0) issues.push("No internal links in content");
  if (h1s > 0) issues.push("Content contains H1 tags (the page title should be the only H1; use H2/H3 inside)");
  if (h2Count === 0 && wordCount > 300) issues.push("No H2 subheadings — add structure");

  return {
    fields: {
      title: post.title,
      slug: post.slug,
      metaTitle,
      metaTitleLength: metaTitle.length,
      metaDescription: metaDesc,
      metaDescriptionLength: metaDesc.length,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      tags: post.tags ?? [],
    },
    onPage: { wordCount, h1InContent: h1s, h2Count, imageCount: imgTags.length, imagesMissingAlt, internalLinks },
    issues,
  };
}

/** SEO tools: read/audit/fix on-page SEO for DB-stored posts + audit live URLs. */
function buildSeoTools(supabase: SupabaseClient<Database>, firecrawlKey?: string): ToolSet {
  const tools: ToolSet = {
    list_site_posts: tool({
      description:
        "List the site's blog posts with their SEO fields so you can pick which to audit or fix. Optionally filter by status.",
      inputSchema: z.object({
        status: z.enum(["all", "draft", "published"]).describe("Filter by status"),
        query: z.string().describe("Optional text to match in the title (empty for none)"),
      }),
      execute: async ({ status, query }) => {
        let q = supabase
          .from("posts")
          .select("id, title, slug, status, meta_title, meta_description, category, updated_at")
          .order("updated_at", { ascending: false })
          .limit(100);
        if (status && status !== "all") q = q.eq("status", status);
        if (query && query.trim()) q = q.ilike("title", `%${query.trim()}%`);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return { posts: data ?? [] };
      },
    }),
    audit_post: tool({
      description:
        "Run a full on-page + technical SEO audit of ONE stored post (by id or slug). Returns SEO fields, on-page metrics and a list of concrete issues to fix.",
      inputSchema: z.object({
        postId: z.string().describe("The post id (uuid). Leave empty if using slug."),
        slug: z.string().describe("The post slug. Leave empty if using postId."),
      }),
      execute: async ({ postId, slug }) => {
        let q = supabase
          .from("posts")
          .select("id, title, slug, excerpt, content, meta_title, meta_description, featured_image, tags, status");
        if (postId && postId.trim()) q = q.eq("id", postId.trim());
        else if (slug && slug.trim()) q = q.eq("slug", slug.trim());
        else throw new Error("Provide a postId or slug");
        const { data, error } = await q.maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Post not found");
        return { id: data.id, status: data.status, audit: analyzePostContent(data) };
      },
    }),
    apply_post_seo: tool({
      description:
        "Apply SEO fixes to a stored post. Only pass the fields you want to change; leave others empty. Use this after auditing and proposing improvements. Content should be full HTML if provided.",
      inputSchema: z.object({
        postId: z.string().describe("The post id (uuid) to update"),
        meta_title: z.string().describe("New meta title, or empty to keep"),
        meta_description: z.string().describe("New meta description, or empty to keep"),
        title: z.string().describe("New post title, or empty to keep"),
        slug: z.string().describe("New slug, or empty to keep"),
        excerpt: z.string().describe("New excerpt, or empty to keep"),
        featured_image: z.string().describe("New featured image URL, or empty to keep"),
        tags: z.array(z.string()).describe("New tags/keywords, or empty array to keep"),
        content: z.string().describe("New full HTML content, or empty to keep"),
      }),
      execute: async (input) => {
        const patch: Database["public"]["Tables"]["posts"]["Update"] = {};
        if (input.meta_title.trim()) patch.meta_title = input.meta_title.trim();
        if (input.meta_description.trim()) patch.meta_description = input.meta_description.trim();
        if (input.title.trim()) patch.title = input.title.trim();
        if (input.slug.trim()) patch.slug = slugify(input.slug);
        if (input.excerpt.trim()) patch.excerpt = input.excerpt.trim();
        if (input.featured_image.trim()) patch.featured_image = input.featured_image.trim();
        if (input.tags && input.tags.length > 0) patch.tags = input.tags;
        if (input.content.trim()) patch.content = input.content;
        if (Object.keys(patch).length === 0) return { ok: false, message: "No fields to update" };
        const { data, error } = await supabase
          .from("posts")
          .update(patch)
          .eq("id", input.postId)
          .select("id, slug")
          .maybeSingle();
        if (error) throw new Error(error.message);
        return { ok: true, updated: Object.keys(patch), id: data?.id, slug: data?.slug };
      },
    }),
  };

  if (firecrawlKey) {
    tools.analyze_url = tool({
      description:
        "Audit any LIVE URL for on-page and technical SEO. Returns title, meta description, canonical, Open Graph tags, robots, headings, images missing alt, word count, and a list of issues.",
      inputSchema: z.object({
        url: z.string().describe("The full URL to audit"),
      }),
      execute: async ({ url }) => {
        const { html, markdown } = await firecrawlScrapeHtml(firecrawlKey, url);
        if (!html) throw new Error("Could not fetch the page HTML");
        return analyzeHtml(html, markdown);
      },
    });
  }

  return tools;
}



export const Route = createFileRoute("/api/ai-writer-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !publishableKey) {
          return new Response("Server misconfigured", { status: 500 });
        }

        const supabase = createClient<Database>(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });

        const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        if (roleErr) return new Response(roleErr.message, { status: 500 });
        if (!isAdmin) return new Response("Forbidden", { status: 403 });

        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        // Load provider (chosen or default or first enabled)
        let providerQuery = supabase
          .from("ai_providers")
          .select("id, base_url, model, api_key, enabled, is_default")
          .eq("enabled", true);
        if (body.providerId) providerQuery = providerQuery.eq("id", body.providerId);
        const { data: providers, error: provErr } = await providerQuery;
        if (provErr) return new Response(provErr.message, { status: 500 });
        if (!providers || providers.length === 0) {
          return new Response(
            "No AI provider configured. Add one under AI Writer → Providers first.",
            { status: 400 },
          );
        }
        const provider = providers.find((p) => p.is_default) ?? providers[0];

        const gateway = createOpenAICompatible({
          name: "user-provider",
          baseURL: provider.base_url,
          headers: { Authorization: `Bearer ${provider.api_key}` },
        });

        const firecrawlKey = process.env.FIRECRAWL_API_KEY;
        const researchOn = body.research !== false && !!firecrawlKey;

        const seoTools = buildSeoTools(supabase, firecrawlKey);
        const researchTools: ToolSet = researchOn
          ? {
              web_search: tool({
                description:
                  "Search the live web for up-to-date information. Returns titles, URLs and snippets.",
                inputSchema: z.object({
                  query: z.string().describe("The search query"),
                  limit: z.number().describe("How many results (1-10)"),
                }),
                execute: async ({ query, limit }) => {
                  const n = Math.max(1, Math.min(10, Math.round(limit || 5)));
                  return await firecrawlSearch(firecrawlKey!, query, n);
                },
              }),
              read_url: tool({
                description: "Fetch and read the main content of a web page as markdown.",
                inputSchema: z.object({
                  url: z.string().describe("The full URL to read"),
                }),
                execute: async ({ url }) => await firecrawlScrape(firecrawlKey!, url),
              }),
            }
          : {};

        const tools: ToolSet = { ...seoTools, ...researchTools };

        try {
          const result = streamText({
            model: gateway(provider.model),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
            tools,
            stopWhen: stepCountIs(50),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
            onError: (error) => {
              console.error("ai-writer stream error", error);
              return error instanceof Error ? error.message : "AI request failed";
            },
          });
        } catch (error) {
          console.error("ai-writer-chat error", error);
          const msg = error instanceof Error ? error.message : "AI request failed";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
