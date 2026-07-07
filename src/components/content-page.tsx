import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteContent } from "@/lib/use-site-data";
import { str, pairs } from "@/lib/site-content";

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="absolute left-1/2 top-0 h-64 w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            {eyebrow && (
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="text-balance text-4xl font-bold sm:text-5xl">{title}</h1>
            {intro && (
              <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
                {intro}
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14">{children}</section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_li]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/** Render admin-authored custom sections (heading + multi-paragraph body). */
function CustomSections({ sections }: { sections: { a: string; b: string }[] }) {
  return (
    <Prose>
      {sections.map((s, i) => (
        <Section key={s.a + i} title={s.a}>
          {s.b
            .split(/\n{2,}|\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, j) => (
              <p key={j}>{p}</p>
            ))}
        </Section>
      ))}
    </Prose>
  );
}

/**
 * ContentPage wrapper that lets an admin override the header text and,
 * optionally, replace the built-in body with custom sections from the CMS.
 */
export function EditablePage({
  pageKey,
  defaultEyebrow,
  defaultTitle,
  defaultIntro,
  children,
}: {
  pageKey: string;
  defaultEyebrow?: string;
  defaultTitle: string;
  defaultIntro?: string;
  children: ReactNode;
}) {
  const c = useSiteContent(pageKey);
  const custom = pairs(c.sections);
  return (
    <ContentPage
      eyebrow={str(c.eyebrow) || defaultEyebrow}
      title={str(c.title) || defaultTitle}
      intro={str(c.intro) || defaultIntro}
    >
      {custom.length > 0 ? <CustomSections sections={custom} /> : children}
    </ContentPage>
  );
}
