// Server-only helpers to build the default robots.txt and the auto-generated
// sitemap.xml. Both the public routes and the admin AI generator reuse these
// so the "auto" output stays identical everywhere.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { platforms } from "@/lib/platforms";

export const SEO_BASE_URL = "https://freevideodownloader.lovable.app";

export const ROBOTS_KEY = "robots_txt";
export const SITEMAP_KEY = "sitemap_xml";

export type SitemapEntry = {
  path: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
};

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export function defaultRobots(): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Block private/auth areas from indexing",
    "Disallow: /auth",
    "Disallow: /admin",
    "",
    `Sitemap: ${SEO_BASE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const staticEntries: SitemapEntry[] = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/how-to-download", changefreq: "monthly", priority: "0.7" },
    { path: "/blog", changefreq: "weekly", priority: "0.7" },
    { path: "/about", changefreq: "monthly", priority: "0.5" },
    { path: "/faq", changefreq: "monthly", priority: "0.5" },
    { path: "/contact", changefreq: "yearly", priority: "0.4" },
    { path: "/privacy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms", changefreq: "yearly", priority: "0.3" },
    { path: "/dmca", changefreq: "yearly", priority: "0.3" },
  ];

  const platformEntries: SitemapEntry[] = platforms.map((p) => ({
    path: `/${p.slug}`,
    changefreq: "weekly",
    priority: "0.9",
  }));

  let blogEntries: SitemapEntry[] = [];
  try {
    const supabase = publicClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    blogEntries = (data ?? []).map((p) => ({
      path: `/blog/${p.slug}`,
      changefreq: "monthly",
      priority: "0.6",
      lastmod: p.published_at ? p.published_at.slice(0, 10) : undefined,
    }));
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...platformEntries, ...blogEntries];
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const fallback = new Date().toISOString().slice(0, 10);
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${SEO_BASE_URL}${e.path}</loc>`,
      `    <lastmod>${e.lastmod ?? fallback}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      `  </url>`,
    ].join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

export async function buildAutoSitemap(): Promise<string> {
  const entries = await buildSitemapEntries();
  return renderSitemapXml(entries);
}

// Reads a site_content text override ({ text: "..." }) by key. Returns null
// when there is no stored override.
export async function readContentOverride(key: string): Promise<string | null> {
  try {
    const supabase = publicClient();
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", key)
      .maybeSingle();
    const content = data?.content as { text?: string } | null;
    const text = content?.text;
    return typeof text === "string" && text.trim().length > 0 ? text : null;
  } catch {
    return null;
  }
}
