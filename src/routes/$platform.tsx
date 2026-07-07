import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, Gift, ClipboardPaste, MousePointerClick, Download } from "lucide-react";
import { getPlatform, platforms } from "@/lib/platforms";
import { PlatformIcon } from "@/lib/platform-icons";
import { getArticle } from "@/lib/platform-content";
import { normalizeArticle } from "@/lib/platform-article";
import { getPublishedPlatformContent } from "@/lib/platform-content.functions";
import { getPublicSiteData } from "@/lib/site-content.functions";
import { PlatformDownloader } from "@/components/platform-downloader";
import { PlatformArticleView } from "@/components/platform-article";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ad-slot";
import { useAds } from "@/lib/use-site-data";

export const Route = createFileRoute("/$platform")({
  loader: async ({ params }) => {
    const base = getPlatform(params.platform);
    if (!base) throw notFound();
    const [stored, siteData] = await Promise.all([
      getPublishedPlatformContent({ data: { slug: base.slug } }).catch(() => null),
      getPublicSiteData().catch(() => null),
    ]);
    const setting = siteData?.tools.find((t) => t.slug === base.slug);
    const platform = {
      ...base,
      name: (setting?.name && setting.name.trim()) || base.name,
      tagline: (setting?.tagline && setting.tagline.trim()) || base.tagline,
      description: (setting?.description && setting.description.trim()) || base.description,
    };
    const enabled = setting?.enabled ?? true;
    const article = normalizeArticle(platform, stored ?? getArticle(platform.slug) ?? null);
    return { platform, article, enabled };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData || !loaderData.enabled) {
      return { meta: [{ title: "Not available — Free Online Video Downloader" }, { name: "robots", content: "noindex" }] };
    }
    const { platform, article } = loaderData;
    const SITE = "https://freevideodownloader.lovable.app";
    const url = `${SITE}/${params.platform}`;
    const title = platform.seoTitle;
    const description = platform.seoDescription;
    const image = `${SITE}/og/${platform.slug}.jpg`;

    const howToSteps = article.howToGeneral.map((s) => ({ name: s.title, text: s.text }));
    const nowIso = new Date().toISOString();

    const jsonLd: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: `${platform.name} Video Downloader`,
        url,
        image,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web, Android, iOS, Windows, macOS",
        description,
        browserRequirements: "Requires JavaScript. Works in any modern browser.",
        featureList: [
          `Download ${platform.name} videos in HD`,
          "No watermark",
          "No sign-up or app required",
          "Free and unlimited",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image,
        author: { "@type": "Organization", name: "Free Online Video Downloader" },
        publisher: {
          "@type": "Organization",
          name: "Free Online Video Downloader",
          logo: { "@type": "ImageObject", url: `${SITE}/og/${platform.slug}.jpg` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: nowIso,
        dateModified: nowIso,
      },
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to download ${platform.name} videos`,
        step: howToSteps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: `${platform.name} Downloader`, item: url },
        ],
      },
    ];

    if (article.faqs.length) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(article.keywords.length ? [{ name: "keywords", content: article.keywords.join(", ") }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: `${platform.name} Video Downloader` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: jsonLd.map((data) => ({
        type: "application/ld+json",
        children: JSON.stringify(data),
      })),
    };
  },
  component: PlatformPage,
  notFoundComponent: PlatformNotFound,
});

const steps = [
  { icon: ClipboardPaste, title: "Copy the link", text: "Grab the video URL from the app or your browser." },
  { icon: MousePointerClick, title: "Paste it here", text: "Drop the link into the box and hit download." },
  { icon: Download, title: "Save it", text: "Choose your quality and the file is yours." },
];

const perks = [
  { icon: Zap, title: "Blazing fast", text: "Servers optimised for instant, high-quality grabs." },
  { icon: Gift, title: "100% free", text: "No sign-up, no limits, no hidden fees — ever." },
  { icon: ShieldCheck, title: "Safe & private", text: "We never store your links or downloaded files." },
];

function PlatformPage() {
  const { platform, article, enabled } = Route.useLoaderData();
  const ads = useAds();
  if (!enabled) return <PlatformUnavailable name={platform.name} />;
  const others = platforms.filter((p) => p.slug !== platform.slug);


  return (
    <div
      className="min-h-screen"
      style={{ ["--brand" as string]: platform.color }}
    >
      <SiteHeader />

      {/* Left / right rail ads (wide screens only) */}
      {ads.left?.code && (
        <div className="pointer-events-auto fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
          <AdSlot code={ads.left.code} />
        </div>
      )}
      {ads.right?.code && (
        <div className="pointer-events-auto fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
          <AdSlot code={ads.right.code} />
        </div>
      )}

      {/* Top banner ad */}
      {ads.top?.code && (
        <div className="mx-auto flex max-w-5xl justify-center px-4 pt-4">
          <AdSlot code={ads.top.code} />
        </div>
      )}

      <main>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div
            className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "color-mix(in oklab, var(--brand) 22%, transparent)" }}
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-4 pt-16 text-center sm:pt-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
              <PlatformIcon slug={platform.slug} className="h-4 w-4 text-brand" />
              {platform.tagline}
            </div>
            <h1 className="text-balance text-4xl font-bold leading-[1.05] sm:text-6xl">
              <span className="text-gradient-brand">{platform.name}</span>
              <br />
              Video Downloader
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              {platform.description}
            </p>

            <div className="mt-10">
              <PlatformDownloader platform={platform} downloadAdUrl={ads.download?.link_url} />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-5xl px-4 py-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Download in three steps
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-3xl border border-border bg-card p-6 shadow-elegant"
              >
                <span className="absolute right-5 top-4 font-display text-5xl font-bold text-brand/15">
                  {i + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Perks */}
        <section className="mx-auto max-w-5xl px-4 pb-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title} className="rounded-3xl border border-border bg-card/60 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO article */}
        <PlatformArticleView platform={platform} article={article} />


        {/* Other platforms */}
        <section className="mx-auto max-w-5xl px-4 py-16">

          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Download from other platforms
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                style={{ ["--brand" as string]: p.color }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-brand/50 hover:bg-secondary"
              >
                <PlatformIcon slug={p.slug} className="h-4 w-4 text-brand" /> {p.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom banner ad */}
        {ads.bottom?.code && (
          <div className="mx-auto flex max-w-5xl justify-center px-4 pb-12">
            <AdSlot code={ads.bottom.code} />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function PlatformNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="text-3xl font-bold">Platform not supported</h1>
        <p className="mt-3 text-muted-foreground">
          We don&apos;t have a downloader for that link yet. Pick one from the list below.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-brand px-5 py-2.5 font-semibold text-brand-foreground"
        >
          See all platforms
        </Link>
      </div>
    </div>
  );
}

function PlatformUnavailable({ name }: { name: string }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="text-3xl font-bold">{name} downloader is unavailable</h1>
        <p className="mt-3 text-muted-foreground">
          This downloader is temporarily turned off. Please check back later or try another
          platform.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
        >
          See all platforms
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
