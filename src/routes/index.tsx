import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap,
  ShieldCheck,
  Sparkles,
  Link2,
  ClipboardPaste,
  Download,
  
  
  Globe,
  Grid3x3,
  MonitorSmartphone,
  Smartphone,
  Lock,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicSiteData } from "@/lib/site-content.functions";
import { mergeContent, str, pairs } from "@/lib/site-content";
import { useSiteContent, useEnabledPlatforms, useBranding, SITE_DATA_QUERY_KEY } from "@/lib/use-site-data";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const data = await context.queryClient
      .ensureQueryData({ queryKey: SITE_DATA_QUERY_KEY, queryFn: () => getPublicSiteData() })
      .catch(() => null);
    const home = mergeContent("home", data?.content?.home);
    return {
      seoTitle: str(home.seoTitle, "Free Online Video Downloader for All Platforms"),
      seoDescription: str(home.seoDescription),
      faqs: pairs(home.faqs).map((f) => ({ q: f.a, a: f.b })),
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.seoTitle ?? "Free Online Video Downloader for All Platforms";
    const description =
      loaderData?.seoDescription ??
"Download supported public videos from YouTube, TikTok, Instagram, Facebook and more. Fast, free, no sign-up.";
    const faqs = loaderData?.faqs ?? [];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "The Complete Guide to Using a Free Online Video Downloader",
            description:
              "How to download videos from YouTube, TikTok, Instagram, Facebook and more — quality options, safety, and best practices.",
            about: "Online video downloader",
            mainEntityOfPage: "https://freevideodownloader.lovable.app/",
          }),
        },
        ...(faqs.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs
                    .filter((f) => f.q && f.a)
                    .map((f) => ({
                      "@type": "Question",
                      name: f.q,
                      acceptedAnswer: { "@type": "Answer", text: f.a },
                    })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: Home,
  errorComponent: () => <Home />,
});

const stepIcons = [Link2, ClipboardPaste, Download];
const featureIcons = [Zap, Globe, Grid3x3, BadgeCheck, MonitorSmartphone, ShieldCheck, Lock, Smartphone];

function Home() {
  const c = useSiteContent("home");
  const platforms = useEnabledPlatforms();
  const branding = useBranding();

  const steps = pairs(c.steps);
  const features = pairs(c.features);
  const faqs = pairs(c.faqs);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="relative overflow-hidden pt-14 pb-8 sm:pt-20 sm:pb-12">
          {/* Ambient glow background */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-[520px] overflow-hidden">
            <div className="bg-grid absolute inset-0 opacity-40" />
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]" />
            <div className="absolute left-1/4 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/25 blur-[110px]" />
            <div className="absolute right-1/4 top-16 h-56 w-56 translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />
          </div>

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-soft">
              <Sparkles className="h-4 w-4" /> {str(c.badge)}
            </div>

            <h1 className="mt-7 text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {str(c.heroTitle)}{" "}
              <span className="text-gradient-brand">{str(c.heroTitleAccent)}</span>
            </h1>

            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              {str(c.heroSubtitle)}
            </p>

            {/* Platform pills */}
            <div id="download" className="mt-9 w-full scroll-mt-24">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {platforms.slice(0, 8).map((p) => (
                  <Link
                    key={p.slug}
                    to="/$platform"
                    params={{ platform: p.slug }}
                    style={{ color: p.color }}
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
                  >
                    <PlatformIcon slug={p.slug} className="h-4 w-4" />
                    <span className="text-foreground">{p.name}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#platforms"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-4 font-display text-base font-bold text-primary-foreground shadow-soft-lg transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <Grid3x3 className="h-5 w-5" strokeWidth={2.5} /> Browse All Downloaders
                </a>
                <Link
                  to="/how-to-download"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 py-4 font-display text-base font-bold text-foreground shadow-soft transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <Zap className="h-5 w-5 text-primary" strokeWidth={2.5} /> How It Works
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> No app needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> Mobile &amp; desktop
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> 100% free
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { icon: Globe, value: `${platforms.length}+`, label: "Platforms" },
                { icon: MonitorSmartphone, value: "HD", label: "Quality" },
                { icon: Lock, value: "Safe", label: "No login" },
                { icon: Zap, value: "Fast", label: "Instant" },
              ] as const
            ).map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card px-4 py-5 text-center shadow-soft"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-xl font-extrabold text-foreground">{s.value}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                </div>
              );
            })}
          </div>
        </section>



        {/* Platforms */}
        <section id="platforms" className="scroll-mt-20 py-14 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {str(c.platformsHeading)}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{str(c.platformsSubtext)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {platforms.map((p) => (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                style={{ color: p.color }}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "color-mix(in oklab, currentColor 14%, white)" }}
                >
                  <PlatformIcon slug={p.slug} className="h-7 w-7" />
                </span>
                <h3 className="mt-3 text-sm font-bold leading-tight text-foreground">{p.name}</h3>
                <p className="text-xs font-medium text-muted-foreground">Video Downloader</p>
              </Link>
            ))}
          </div>
        </section>


        {/* How it works */}
        <section className="py-14 sm:py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {str(c.howHeading)}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{str(c.howSubtext)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = stepIcons[i % stepIcons.length];
              return (
                <div
                  key={s.a + i}
                  className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
                >
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs font-extrabold text-primary">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{s.a}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.b}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why use */}
        <section className="py-14 sm:py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {str(c.whyHeading)}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{str(c.whySubtext)}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = featureIcons[i % featureIcons.length];
              return (
                <div
                  key={f.a + i}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold">{f.a}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.b}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Notices */}
        <section className="space-y-4 pb-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 text-center text-sm leading-relaxed text-muted-foreground sm:px-8">
            <span className="font-bold text-foreground">{str(branding.siteName)}</span> helps you save
            supported public videos for personal offline use. Always respect creator rights, platform
            rules, and copyright laws.
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <p>
              <span className="font-bold text-foreground">Important:</span> Use this tool only for your
              own videos, public videos, or content you have permission to download. Private,
              restricted, paid, or copyrighted content may not be supported.
            </p>
          </div>
        </section>

        {/* SEO article */}
        <section className="py-14 sm:py-20">
          <article className="mx-auto max-w-3xl">
            <header className="mb-8 text-center">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
                The Complete Guide to Using a Free Online Video Downloader
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Everything you need to know about downloading videos from YouTube, TikTok, Instagram,
                Facebook and more — quality options, safety, and best practices.
              </p>
            </header>

            <div className="space-y-8 text-[15px] leading-relaxed text-muted-foreground">
              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  What is an online video downloader?
                </h3>
                <p>
                  A <strong className="font-semibold text-foreground">free online video downloader</strong>{" "}
                  is a browser-based tool that lets you save public videos from social platforms
                  directly to your phone or computer — no software installation, no sign-up, and no
                  hidden fees. Instead of installing a separate app for every website, you simply
                  paste a link and choose the format you want. Because everything runs in your
                  browser, the same tool works on Android, iPhone, Windows, and Mac.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  How to download a video in three steps
                </h3>
                <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-primary">
                  <li>
                    <strong className="font-semibold text-foreground">Copy the video link.</strong>{" "}
                    Open the app or website, tap Share, and copy the URL of the video you want to
                    save.
                  </li>
                  <li>
                    <strong className="font-semibold text-foreground">Pick your platform.</strong>{" "}
                    Choose the matching downloader — for example, our{" "}
                    <Link to="/$platform" params={{ platform: "youtube" }} className="font-semibold text-primary hover:underline">
                      YouTube video downloader
                    </Link>{" "}
                    or{" "}
                    <Link to="/$platform" params={{ platform: "tiktok" }} className="font-semibold text-primary hover:underline">
                      TikTok downloader
                    </Link>
                    .
                  </li>
                  <li>
                    <strong className="font-semibold text-foreground">Download &amp; save.</strong>{" "}
                    Paste the link, select a quality (HD, SD, or audio-only MP3), and the file saves
                    straight to your device.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Which platforms can I download from?
                </h3>
                <p className="mb-3">
                  {str(branding.siteName)} supports the most popular social and video networks.
                  Each platform has a dedicated tool tuned for its formats:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {platforms.map((p) => (
                    <Link
                      key={p.slug}
                      to="/$platform"
                      params={{ platform: p.slug }}
                      style={{ color: p.color }}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold shadow-soft transition-colors hover:bg-secondary"
                    >
                      <PlatformIcon slug={p.slug} className="h-4 w-4" />
                      <span className="text-foreground">{p.name} Downloader</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Choosing the right video quality and format
                </h3>
                <p>
                  Most videos can be saved in several resolutions. Pick{" "}
                  <strong className="font-semibold text-foreground">1080p or 4K HD</strong> when you
                  want the sharpest picture for a large screen, or a lighter{" "}
                  <strong className="font-semibold text-foreground">720p / SD</strong> file to save
                  storage and data. If you only need the sound — a song, podcast, or interview —
                  choose the <strong className="font-semibold text-foreground">MP3 audio</strong>{" "}
                  option to extract just the audio track. Higher resolutions produce larger files,
                  so match the quality to how you plan to watch.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Is it safe and legal to download videos?
                </h3>
                <p>
                  Our downloader runs entirely over a secure connection and never asks you to
                  install extensions or create an account, which keeps the process safe and
                  private. When it comes to legality, download responsibly: save{" "}
                  <strong className="font-semibold text-foreground">your own content</strong>,{" "}
                  <strong className="font-semibold text-foreground">public videos</strong>, or
                  material you have permission to use, and keep downloads for personal, offline
                  viewing. Always respect creator rights, platform terms of service, and local
                  copyright law. Avoid redistributing copyrighted work without consent.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Why use a browser-based downloader?
                </h3>
                <p>
                  Compared with desktop programs, an online tool is faster to start and works on
                  any device with a browser. There is nothing to update, it takes up zero storage,
                  and it is completely free with no watermarks. Whether you are archiving a favorite
                  clip, saving a tutorial for offline study, or keeping a backup of your own posts,
                  a web downloader is the simplest way to get high-quality video files in seconds.
                </p>
              </div>
            </div>
          </article>
        </section>



        {/* FAQ */}
        <section className="py-14 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {str(c.faqHeading)}
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((f, i) => (
              <details
                key={f.a + i}
                className="group rounded-2xl border border-border bg-card px-5 py-4 shadow-soft sm:px-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  {f.a}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.b}</p>
              </details>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
