import { Check, HelpCircle, Clock, CalendarDays, PenLine, ShieldCheck, Wrench, Smartphone, Apple, Monitor, ArrowLeftRight } from "lucide-react";
import type { Platform } from "@/lib/platforms";
import type { RichPlatformArticle } from "@/lib/platform-article";

const BRAND = "Free Online Video Downloader";

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-4 space-y-2.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
            {i + 1}
          </span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}


export function PlatformArticleView({
  platform,
  article,
}: {
  platform: Platform;
  article: RichPlatformArticle;
}) {
  const name = platform.name;

  const toc = [
    { id: "benefits", label: `Why use ${BRAND}` },
    { id: "how-to", label: "How to download" },
    { id: "formats", label: "Formats & quality" },
    { id: "use-cases", label: "Use cases" },
    { id: "safety", label: "Safe & legal?" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "comparison", label: "Online vs app" },
    { id: "alternatives", label: "Alternatives" },
    
    { id: "faqs", label: "FAQs" },
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {/* E-E-A-T meta bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" /> Updated {article.lastUpdated}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {article.readingMinutes} min read
        </span>
        <span className="inline-flex items-center gap-1.5">
          <PenLine className="h-3.5 w-3.5" /> {article.authorName}
        </span>
      </div>

      {/* Quick answer for AEO / GEO answer engines */}
      <div className="mt-6 rounded-3xl border border-brand/30 bg-brand/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">In short</p>
        <p className="mt-2 text-lg font-medium leading-relaxed text-foreground">{article.answer}</p>
      </div>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm font-bold">On this page</p>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {toc.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="transition-colors hover:text-brand">
                {i + 1}. {t.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Intro */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Free {name} video downloader</h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
          {article.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">Why use {BRAND} for {name}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {article.benefits.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand" strokeWidth={3} />
                <h3 className="font-bold">{f.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to */}
      <section id="how-to" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">How to download {name} videos</h2>
        <div className="mt-4 space-y-2.5">
          {article.howToGeneral.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{s.title}. </span>
                {s.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-brand" />
              <h3 className="font-bold">On Android</h3>
            </div>
            <StepList steps={article.androidSteps} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4 text-brand" />
              <h3 className="font-bold">On iPhone</h3>
            </div>
            <StepList steps={article.iphoneSteps} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-brand" />
              <h3 className="font-bold">On PC / Mac</h3>
            </div>
            <StepList steps={article.pcSteps} />
          </div>
        </div>
      </section>

      {/* Formats */}
      <section id="formats" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">Supported formats &amp; quality</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{article.formats}</p>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">When it comes in handy</h2>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {article.useCases.map((u) => (
            <li key={u} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={3} />
              {u}
            </li>
          ))}
        </ul>
      </section>

      {/* Safety */}
      <section id="safety" className="mt-12 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <ShieldCheck className="h-6 w-6 text-brand" /> Is it safe &amp; legal?
        </h2>
        <ul className="mt-5 space-y-3">
          {article.safety.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={3} />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="mt-12 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Wrench className="h-6 w-6 text-brand" /> Why a download won&apos;t work
        </h2>
        <ul className="mt-5 space-y-2.5">
          {article.troubleshooting.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Comparison */}
      <section id="comparison" className="mt-12 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <ArrowLeftRight className="h-6 w-6 text-brand" /> Online tool vs app
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Feature</th>
                <th className="px-4 py-3 font-semibold text-brand">{BRAND}</th>
                <th className="px-4 py-3 font-semibold">App downloader</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {article.comparison.map((row) => (
                <tr key={row.feature}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.online}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.app}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alternatives */}
      <section id="alternatives" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">{name} downloader alternatives</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{article.alternatives}</p>
      </section>




      {/* FAQ */}
      <section id="faqs" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">{name} downloader — FAQs</h2>
        <div className="mt-6 divide-y divide-border rounded-3xl border border-border bg-card">
          {article.faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 shrink-0 text-brand" />
                  {f.q}
                </span>
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}
