// Client-safe helpers shared by admin editor and public blog pages.

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

/**
 * Auto-adds stable id anchors to every h2/h3 in the article HTML and returns
 * a table-of-contents list built from those headings.
 */
export function processArticleHtml(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const processed = (html || "").replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, lvl: string, attrs: string, inner: string) => {
      const level = Number(lvl) as 2 | 3;
      const text = inner.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      if (!text) return `<h${lvl}${attrs}>${inner}</h${lvl}>`;

      const base = slugify(text) || `section-${toc.length + 1}`;
      let unique = base;
      let i = 2;
      while (used.has(unique)) unique = `${base}-${i++}`;
      used.add(unique);
      toc.push({ id: unique, text, level });

      const cleaned = attrs.replace(/\sid="[^"]*"/gi, "");
      return `<h${lvl}${cleaned} id="${unique}">${inner}</h${lvl}>`;
    },
  );

  return { html: processed, toc };
}

export function readingTimeMinutes(html: string): number {
  const text = (html || "").replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function excerptFromHtml(html: string, max = 160): string {
  const text = (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
