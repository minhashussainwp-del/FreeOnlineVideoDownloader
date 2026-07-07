import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Zap,
  Gift,
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
import { useSiteContent, useEnabledPlatforms, SITE_DATA_QUERY_KEY } from "@/lib/use-site-data";

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
      scripts:
        faqs.length > 0
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
          : [],
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

  const steps = pairs(c.steps);
  const features = pairs(c.features);
  const faqs = pairs(c.faqs);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="relative pt-8 sm:pt-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/40 px-6 py-16 shadow-elegant backdrop-blur-xl sm:px-12 sm:py-24">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-accent/25 blur-[110px]" />
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-25" />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-md">
                <Sparkles className="h-4 w-4" /> {str(c.badge)}
              </div>

              <div className="space-y-5">
                <h1 className="text-balance bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
                  {str(c.heroTitle)}
                  <br />
                  <span className="text-gradient-brand">{str(c.heroTitleAccent)}</span>
                </h1>
                <p className="mx-auto max-w-xl text-balance text-lg text-muted-foreground">
                  {str(c.heroSubtitle)}
                </p>
              </div>

              <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-brand backdrop-blur-xl sm:p-8">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">{str(c.ctaHeading)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{str(c.ctaSubheading)}</p>
                </div>

                <a
                  href="#platforms"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-4 font-display text-base font-bold text-primary-foreground shadow-brand transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  {str(c.ctaButton)} <ArrowUpRight className="h-5 w-5" />
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                  <Zap className="h-3.5 w-3.5" /> No app needed
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-accent">
                  <Gift className="h-3.5 w-3.5" /> Always free
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" /> Public videos only
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section id="platforms" className="scroll-mt-20 py-14 sm:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {str(c.platformsHeading)}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{str(c.platformsSubtext)}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((p) => (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                style={{ ["--brand" as string]: p.color }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-elegant transition-all hover:-translate-y-1 hover:border-brand/70"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
                  style={{ background: "color-mix(in oklab, var(--brand) 40%, transparent)" }}
                />
                <div className="relative flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/25">
                    <PlatformIcon slug={p.slug} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold tracking-tight">{p.name} Video Downloader</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                      Open downloader
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{str(c.howHeading)}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{str(c.howSubtext)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = stepIcons[i % stepIcons.length];
              return (
                <div
                  key={s.a + i}
                  className="relative rounded-3xl border border-border bg-card p-6 shadow-elegant"
                >
                  <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-primary/15">
                    {i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Icon className="h-6 w-6" />
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
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{str(c.whyHeading)}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{str(c.whySubtext)}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = featureIcons[i % featureIcons.length];
              return (
                <div key={f.a + i} className="rounded-3xl border border-border bg-card p-5 shadow-elegant">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold">{f.a}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.b}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEO article */}
        <section className="py-14 sm:py-20">
          <article className="mx-auto max-w-3xl">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Online Video Downloader: Save Any Video Fast, Free &amp; in HD
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Looking for a simple way to keep your favorite clips for offline viewing? Our free
                online video downloader lets you save supported public videos from the platforms you
                use every day — without installing any software or creating an account. Paste a link,
                pick your quality, and download. That is it.
              </p>
              <p>
                Whether you want to rewatch a tutorial on a long flight, keep a memory that might
                disappear, or store clips you have permission to save, this video download tool makes
                the whole process quick and stress-free. It works right in your browser on both
                mobile and desktop.
              </p>
            </div>

            <h3 className="mt-10 text-2xl font-bold tracking-tight">
              A quick note on safety and legal use
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Please download responsibly. Only save videos that you own, that are public, or that
              you have clear permission to download. Avoid downloading private, paid, or
              copyright-protected content, as this may break a platform's terms of service and the
              law. Respecting creators keeps the internet fair for everyone.
            </p>
          </article>
        </section>

        {/* Safety / legal notice */}
        <section className="pb-4">
          <div className="flex items-start gap-3 rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Safety &amp; legal notice.</span>{" "}
              Use this tool only for your own videos, public videos, or content you have permission
              to download. Private, restricted, paid, or copyright-protected content should not be
              saved. Downloading from some platforms may be against their terms of service.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{str(c.faqHeading)}</h2>
          </div>

          <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {faqs.map((f, i) => (
              <details key={f.a + i} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {f.a}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.b}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="pb-16 sm:pb-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-elegant sm:px-12">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
                {str(c.finalCtaHeading)}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                {str(c.finalCtaSubtext)}
              </p>
              <a
                href="#platforms"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 font-display text-base font-bold text-primary-foreground shadow-brand transition-transform hover:scale-[1.04]"
              >
                {str(c.finalCtaButton)} <ArrowUpRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
