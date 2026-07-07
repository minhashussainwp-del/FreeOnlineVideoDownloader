import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Search, Mail, Folder } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { listPublishedPosts } from "@/lib/blog.functions";
import { formatDate } from "@/lib/blog-utils";
import { useBranding } from "@/lib/use-site-data";

const postsQuery = queryOptions({
  queryKey: ["published-posts"],
  queryFn: () => listPublishedPosts(),
});

export const Route = createFileRoute("/blog/")({
  head: ({ loaderData }) => {
    const title = "Blog — Online Video Downloader";
    const description =
      "Guides, tips and tutorials on downloading videos and audio from your favourite platforms — fast, free and safe.";
    const posts = Array.isArray(loaderData) ? loaderData : [];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/blog" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/blog" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: "https://freevideodownloader.lovable.app/blog",
            hasPart: posts.slice(0, 20).map((p: { title: string; slug: string }) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://freevideodownloader.lovable.app/blog/${p.slug}`,
            })),
          }),
        },
      ],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: BlogIndex,
});

function readTime(p: { excerpt?: string | null; title?: string | null }) {
  const len = (p.excerpt?.length ?? 0) + (p.title?.length ?? 0);
  return `${Math.max(3, Math.ceil(len / 120))} min read`;
}

function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
      {children}
    </span>
  );
}

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  const branding = useBranding();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [posts, query]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      if (p.category) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const popular = posts.slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-hero">
          <div className="bg-grid absolute inset-0 opacity-50" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              {branding.siteName} <span className="text-gradient-brand">Blog</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-muted-foreground">
              Tips, guides, news, and everything about video downloading.
            </p>
            <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 shadow-soft-lg">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blog articles..."
                className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
            {/* Articles */}
            <div>
              <h2 className="mb-6 text-2xl font-extrabold tracking-tight">Latest Articles</h2>
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                  <h3 className="font-display text-lg font-bold">No articles found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search term or check back soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {filtered.map((p) => (
                    <Link
                      key={p.id}
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg sm:gap-5 sm:p-4"
                    >
                      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl sm:w-36 sm:aspect-video">
                        {p.featured_image ? (
                          <img
                            src={p.featured_image}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary to-accent" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        {p.category && (
                          <div className="mb-1.5">
                            <CategoryTag>{p.category}</CategoryTag>
                          </div>
                        )}
                        <h3 className="font-display text-base font-bold leading-snug sm:text-lg">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                            {p.excerpt}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
                          <span>{formatDate(p.published_at)}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {readTime(p)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {categories.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wide">
                    Categories
                  </h3>
                  <div className="mt-4 space-y-1">
                    <button
                      onClick={() => setQuery("")}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Folder className="h-4 w-4" /> All Articles
                      </span>
                      <span className="font-bold text-foreground">{posts.length}</span>
                    </button>
                    {categories.map(([name, count]) => (
                      <button
                        key={name}
                        onClick={() => setQuery(name)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Folder className="h-4 w-4" /> {name}
                        </span>
                        <span className="font-bold text-foreground">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {popular.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wide">
                    Popular Articles
                  </h3>
                  <div className="mt-4 space-y-3">
                    {popular.map((p) => (
                      <Link
                        key={p.id}
                        to="/blog/$slug"
                        params={{ slug: p.slug }}
                        className="group flex items-center gap-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                          {p.featured_image ? (
                            <img
                              src={p.featured_image}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary to-accent" />
                          )}
                        </div>
                        <span className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                          {p.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h3 className="inline-flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wide">
                  <Mail className="h-4 w-4 text-primary" /> Newsletter
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get tips, guides, and updates straight to your inbox.
                </p>
                <form
                  className="mt-4 space-y-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
