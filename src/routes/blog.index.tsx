import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Newspaper, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { listPublishedPosts } from "@/lib/blog.functions";
import { formatDate } from "@/lib/blog-utils";

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

function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {children}
    </span>
  );
}

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="absolute left-1/2 top-0 h-64 w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
            <p className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-primary">
              <Newspaper className="h-4 w-4" /> The Blog
            </p>
            <h1 className="text-balance text-4xl font-bold sm:text-5xl">
              Tips, guides & how-tos
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
              Everything you need to download smarter — practical walkthroughs and platform tips.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
              <h2 className="font-display text-lg font-bold">No articles yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon for new posts.</p>
            </div>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured && (
                <Link
                  to="/blog/$slug"
                  params={{ slug: featured.slug }}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-elegant transition-transform hover:-translate-y-1 sm:col-span-2 lg:row-span-2 lg:min-h-[420px]"
                >
                  {featured.featured_image ? (
                    <>
                      <img
                        src={featured.featured_image}
                        alt={featured.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-accent/10" />
                  )}
                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      {featured.category && <CategoryBadge>{featured.category}</CategoryBadge>}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(featured.published_at)}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-balance sm:text-3xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-2 line-clamp-2 max-w-xl text-muted-foreground">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )}

              {rest.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {p.featured_image ? (
                      <img
                        src={p.featured_image}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/25 to-accent/10" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center gap-2">
                      {p.category && <CategoryBadge>{p.category}</CategoryBadge>}
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatDate(p.published_at)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold leading-snug">{p.title}</h3>
                    {p.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                    )}
                    <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
