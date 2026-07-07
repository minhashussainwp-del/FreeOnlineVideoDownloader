import { createFileRoute, notFound, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, ListTree, AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedPostBySlug } from "@/lib/blog.functions";
import { formatDate, processArticleHtml, readingTimeMinutes } from "@/lib/blog-utils";

const SITE = "https://freevideodownloader.lovable.app";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["published-post", slug],
    queryFn: () => getPublishedPostBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!post) throw notFound();
    return post;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Post not found — Blog" }, { name: "robots", content: "noindex" }],
      };
    }
    const post = loaderData;
    const url = `${SITE}/blog/${params.slug}`;
    const title = post.meta_title || `${post.title} — Blog`;
    const description =
      post.meta_description || post.excerpt || `Read ${post.title} on our video downloader blog.`;

    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (post.featured_image) {
      meta.push({ property: "og:image", content: post.featured_image });
      meta.push({ name: "twitter:image", content: post.featured_image });
    }

    const jsonLd: Record<string, unknown>[] = [
      {
"@context": "https://schema.org",
"@type": "Article",
        headline: post.title,
        description,
        image: post.featured_image ? [post.featured_image] : undefined,
        author: {
"@type": post.author_name ? "Person" : "Organization",
          name: post.author_name || "Free Online Video Downloader",
        },
        publisher: { "@type": "Organization", name: "Free Online Video Downloader" },
        datePublished: post.published_at ?? undefined,
        dateModified: post.updated_at ?? post.published_at ?? undefined,
        mainEntityOfPage: url,
      },
      {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ];

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: jsonLd.map((data) => ({
        type: "application/ld+json",
        children: JSON.stringify(data),
      })),
    };
  },
  component: BlogPost,
  errorComponent: BlogPostError,
  notFoundComponent: BlogPostNotFound,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));

  if (!post) return <BlogPostNotFound />;

  const { html, toc } = processArticleHtml(post.content ?? "");
  const minutes = readingTimeMinutes(post.content ?? "");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="absolute left-1/2 top-0 h-64 w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
            <Link
              to="/blog"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {post.category && (
                <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {post.category}
                </span>
              )}
              {post.tags?.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
            <h1 className="text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {post.author_name && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {post.author_name}
                </span>
              )}
              {post.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(post.published_at)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {minutes} min read
              </span>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 py-12">
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="mb-10 aspect-video w-full rounded-3xl border border-border object-cover shadow-elegant"
            />
          )}

          {toc.length > 2 && (
            <nav className="mb-10 rounded-2xl border border-border bg-card/60 p-5">
              <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ListTree className="h-4 w-4 text-primary" /> On this page
              </p>
              <ul className="space-y-1.5 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="mt-14 flex items-center justify-between border-t border-border/60 pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Download a video <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function BlogPostError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl font-bold">Couldn't load this article</h1>
        <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
        <button
          onClick={() => {
            reset();
            router.invalidate();
          }}
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
      <SiteFooter />
    </div>
  );
}

function BlogPostNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-muted-foreground">
          This post may have been removed or is no longer published.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
        >
          Browse the blog
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
