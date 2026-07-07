import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, ClipboardPaste, MousePointerClick, Download, Link2, Globe, MonitorSmartphone, FileVideo, BadgeCheck, Lock, Music, Gauge, Smartphone } from "lucide-react";
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
  { icon: Link2, title: "Copy the Link", text: "Grab the video URL from the app or your browser." },
  { icon: ClipboardPaste, title: "Paste the URL", text: "Paste the link into the box above." },
  { icon: MousePointerClick, title: "Click Download", text: "Hit the Download button to process it." },
  { icon: Download, title: "Choose & Save", text: "Choose your quality and save the file." },
];

const perks = [
  { icon: Zap, title: "Fast Online Tool", text: "Optimised servers for instant, high-quality grabs." },
  { icon: Lock, title: "No Software Installation", text: "Everything runs in your browser — nothing to install." },
  { icon: Globe, title: "Works in Browser", text: "Use it on any modern browser, anywhere." },
  { icon: MonitorSmartphone, title: "Mobile & Desktop Friendly", text: "Works great on phones, tablets and computers." },
  { icon: FileVideo, title: "MP4 Download", text: "Save clips as MP4 where the source allows." },
  { icon: BadgeCheck, title: "HD Quality", text: "Grab the highest available resolution." },
  { icon: ShieldCheck, title: "Clean & Secure", text: "We never store your links or downloaded files." },
];

const downloadOptions = [
  { icon: FileVideo, title: "MP4 Video", text: "Download MP4 videos." },
  { icon: Music, title: "MP3 Audio", text: "Extract MP3 audio." },
  { icon: BadgeCheck, title: "HD Quality", text: "High quality download." },
  { icon: Gauge, title: "Standard Quality", text: "Normal quality files." },
  { icon: Smartphone, title: "Mobile Friendly", text: "Works on all mobile devices." },
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
        <section className="relative overflow-hidden bg-hero">
          <div className="bg-grid absolute inset-0 opacity-50" />
          <div className="relative mx-auto max-w-3xl px-4 pb-6 pt-16 text-center sm:pt-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-soft">
              <PlatformIcon slug={platform.slug} className="h-4 w-4 text-brand" />
              {platform.tagline}
            </div>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {platform.name}{" "}
              <span className="text-gradient-brand">Video Downloader</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              {platform.description}
            </p>

            <div className="mt-10">
              <PlatformDownloader platform={platform} downloadAdUrl={ads.download?.link_url} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> No app needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> Works on mobile &amp; desktop
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> Fast processing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> MP4/HD where available
              </span>
            </div>
          </div>
        </section>


        {/* Steps */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            How to Download {platform.name} Videos Online
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
              >
                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs font-extrabold text-primary">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-4 text-base font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why use */}
        <section className="mx-auto max-w-5xl px-4 pb-8">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            Why Use This {platform.name} Video Downloader?
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-5 text-center sm:grid-cols-3 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Available download options */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Available Download Options</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {downloadOptions.map((o) => (
              <div
                key={o.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <o.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold">{o.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{o.text}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
            Download options depend on video availability, platform rules, and original upload quality.
          </p>
        </section>

        {/* SEO article */}
        <PlatformArticleView platform={platform} article={article} />

        {/* More downloader tools */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            More Video Downloader Tools
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {others.slice(0, 10).map((p) => (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                style={{ color: p.color }}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "color-mix(in oklab, currentColor 14%, white)" }}
                >
                  <PlatformIcon slug={p.slug} className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-bold leading-tight text-foreground">{p.name}</h3>
                <p className="text-xs font-medium text-muted-foreground">Video Downloader</p>
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
