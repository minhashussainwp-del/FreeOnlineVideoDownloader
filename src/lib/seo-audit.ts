// Shared, framework-agnostic SEO scoring used by both the server functions
// (bulk audit) and the admin dashboard UI. Keep this file free of any
// server-only imports so it stays safe for the client bundle.

export type SeoIssueSeverity = "critical" | "warning" | "info";

export type SeoIssue = {
  id: string;
  label: string;
  severity: SeoIssueSeverity;
  detail: string;
};

export type AuditablePost = {
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
};

export type PostAuditResult = {
  score: number;
  grade: string;
  passed: number;
  total: number;
  issues: SeoIssue[];
};

// Decode the handful of HTML entities that affect word/character counts.
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&[a-z0-9#]+;/gi, " ");
}

// Content is stored as HTML (rich-text editor). Strip tags/entities first, then
// clean up any leftover Markdown artefacts so counts work for either format.
function toPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\-|]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text: string): number {
  const stripped = toPlainText(text);
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

// Detects H2–H6 subheadings in HTML (<h2>…</h6>) or Markdown (## / ###).
function hasSubheadings(content: string): boolean {
  if (/<h[2-6][\s>]/i.test(content)) return true;
  return /(^|\n)#{2,6}\s+\S/.test(content);
}

type ContentImage = { alt: string; hasAltAttr: boolean };

// Extracts every in-content image (HTML <img> or Markdown ![alt](src)) with its
// alt text so we can score missing or weak alt attributes accurately.
function extractImages(content: string): ContentImage[] {
  const images: ContentImage[] = [];

  for (const m of content.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const altMatch = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!altMatch) {
      images.push({ alt: "", hasAltAttr: false });
    } else {
      const raw = altMatch[2] ?? altMatch[3] ?? altMatch[4] ?? "";
      images.push({ alt: decodeEntities(raw).trim(), hasAltAttr: true });
    }
  }

  for (const m of content.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
    images.push({ alt: (m[1] || "").trim(), hasAltAttr: true });
  }

  return images;
}

type Check = {
  id: string;
  label: string;
  weight: number;
  severity: SeoIssueSeverity;
  test: (p: AuditablePost) => boolean;
  fail: string;
};

const CHECKS: Check[] = [
  {
    id: "meta_title",
    label: "Meta title",
    weight: 15,
    severity: "critical",
    test: (p) => {
      const t = (p.meta_title || p.title || "").trim();
      return t.length >= 30 && t.length <= 60;
    },
    fail: "Meta title should be 30–60 characters. Set a concise, keyword-rich meta title.",
  },
  {
    id: "meta_description",
    label: "Meta description",
    weight: 15,
    severity: "critical",
    test: (p) => {
      const d = (p.meta_description || p.excerpt || "").trim();
      return d.length >= 120 && d.length <= 160;
    },
    fail: "Meta description should be 120–160 characters with a clear value proposition.",
  },
  {
    id: "title",
    label: "Post title",
    weight: 10,
    severity: "warning",
    test: (p) => {
      const t = (p.title || "").trim();
      return t.length >= 20 && t.length <= 70;
    },
    fail: "Title should be 20–70 characters — long enough to be descriptive, short enough to not truncate.",
  },
  {
    id: "content_length",
    label: "Content depth",
    weight: 15,
    severity: "critical",
    test: (p) => countWords(p.content || "") >= 300,
    fail: "Content is thin (under 300 words). Expand with useful, original detail.",
  },
  {
    id: "content_rich",
    label: "In-depth content",
    weight: 6,
    severity: "info",
    test: (p) => countWords(p.content || "") >= 800,
    fail: "Consider expanding to 800+ words for competitive topics.",
  },
  {
    id: "headings",
    label: "Subheadings",
    weight: 6,
    severity: "warning",
    test: (p) => hasSubheadings(p.content || ""),
    fail: "Add H2/H3 subheadings to structure the content for readers and crawlers.",
  },
  {
    id: "excerpt",
    label: "Excerpt",
    weight: 6,
    severity: "warning",
    test: (p) => (p.excerpt || "").trim().length >= 40,
    fail: "Add an excerpt (40+ chars) used for previews and search snippets.",
  },
  {
    id: "featured_image",
    label: "Featured image",
    weight: 7,
    severity: "warning",
    test: (p) => !!(p.featured_image || "").trim(),
    fail: "Add a featured image — improves click-through and social sharing.",
  },
  {
    id: "image_alt",
    label: "Image alt text",
    weight: 6,
    severity: "warning",
    test: (p) => {
      const imgs = extractImages(p.content || "");
      if (imgs.length === 0) return true; // no in-content images = nothing to fail
      // Fail when any image has no alt attribute, an empty alt, or a weak alt
      // (fewer than 4 characters, which reads as placeholder text to crawlers).
      return imgs.every((img) => img.hasAltAttr && img.alt.length >= 4);
    },
    fail: "Some in-content images are missing or have weak alt text. Add a descriptive alt attribute (4+ chars) to every image.",
  },
  {
    id: "tags",
    label: "Tags",
    weight: 6,
    severity: "info",
    test: (p) => (p.tags || []).length >= 3,
    fail: "Add at least 3 relevant tags to improve internal discovery.",
  },
  {
    id: "category",
    label: "Category",
    weight: 4,
    severity: "info",
    test: (p) => !!(p.category || "").trim(),
    fail: "Assign a category to group and structure content.",
  },
  {
    id: "slug",
    label: "URL slug",
    weight: 4,
    severity: "warning",
    test: (p) => {
      const s = (p.slug || "").trim();
      return s.length > 0 && s.length <= 60 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
    },
    fail: "Slug should be lowercase, hyphenated and under 60 characters.",
  },
];

const TOTAL_WEIGHT = CHECKS.reduce((sum, c) => sum + c.weight, 0);

export function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

export function auditPost(post: AuditablePost): PostAuditResult {
  let earned = 0;
  let passed = 0;
  const issues: SeoIssue[] = [];

  for (const check of CHECKS) {
    if (check.test(post)) {
      earned += check.weight;
      passed += 1;
    } else {
      issues.push({
        id: check.id,
        label: check.label,
        severity: check.severity,
        detail: check.fail,
      });
    }
  }

  const score = Math.round((earned / TOTAL_WEIGHT) * 100);
  return {
    score,
    grade: gradeFor(score),
    passed,
    total: CHECKS.length,
    issues,
  };
}

export const scoreTone = (score: number): string => {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-destructive";
};

// ---------------------------------------------------------------------------
// "Where to fix" guidance — maps every audit issue id to the exact post field
// it lives in, a deep-link anchor into the post editor, whether it can be
// auto-fixed by the AI, and a plain-English description of the required change.
// ---------------------------------------------------------------------------

export type PostField =
  | "meta_title"
  | "meta_description"
  | "title"
  | "content"
  | "excerpt"
  | "featured_image"
  | "tags"
  | "category"
  | "slug";

export type FixGuide = {
  /** The post column that needs editing. */
  field: PostField;
  /** Human label for the field. */
  fieldLabel: string;
  /** Editor deep-link anchor (matches an element id in the post editor). */
  anchor: string;
  /** Whether the one-click "Apply suggested fixes" action can repair this. */
  autoFixable: boolean;
  /** Where in the editor to make the change. */
  where: string;
  /** What change is required, in plain English. */
  how: string;
};

export const ISSUE_FIX_GUIDE: Record<string, FixGuide> = {
  meta_title: {
    field: "meta_title",
    fieldLabel: "Meta title",
    anchor: "seo-meta-title",
    autoFixable: true,
    where: "Search appearance → Meta title",
    how: "Write a 30–60 character title that leads with the primary keyword.",
  },
  meta_description: {
    field: "meta_description",
    fieldLabel: "Meta description",
    anchor: "seo-meta-description",
    autoFixable: true,
    where: "Search appearance → Meta description",
    how: "Write a 120–160 character description with a clear value proposition and keyword.",
  },
  title: {
    field: "title",
    fieldLabel: "Post title",
    anchor: "post-title",
    autoFixable: true,
    where: "Top of the editor → Title",
    how: "Make the title 20–70 characters — descriptive but not truncated in search.",
  },
  content_length: {
    field: "content",
    fieldLabel: "Content",
    anchor: "post-content",
    autoFixable: false,
    where: "Editor → Content",
    how: "Expand the article to at least 300 words of useful, original detail.",
  },
  content_rich: {
    field: "content",
    fieldLabel: "Content",
    anchor: "post-content",
    autoFixable: false,
    where: "Editor → Content",
    how: "Grow the article toward 800+ words to compete on this topic.",
  },
  headings: {
    field: "content",
    fieldLabel: "Content",
    anchor: "post-content",
    autoFixable: false,
    where: "Editor → Content",
    how: "Add H2/H3 subheadings to structure the article for readers and crawlers.",
  },
  excerpt: {
    field: "excerpt",
    fieldLabel: "Excerpt",
    anchor: "post-excerpt",
    autoFixable: true,
    where: "Editor → Excerpt",
    how: "Add a 40+ character excerpt used for list previews and search snippets.",
  },
  featured_image: {
    field: "featured_image",
    fieldLabel: "Featured image",
    anchor: "featured-image",
    autoFixable: false,
    where: "Sidebar → Featured image",
    how: "Upload a featured image to improve click-through and social sharing.",
  },
  image_alt: {
    field: "content",
    fieldLabel: "Content images",
    anchor: "post-content",
    autoFixable: false,
    where: "Editor → Content",
    how: "Add descriptive alt text to every in-content image.",
  },
  tags: {
    field: "tags",
    fieldLabel: "Tags",
    anchor: "post-tags",
    autoFixable: true,
    where: "Sidebar → Tags",
    how: "Add at least 3 relevant, comma-separated tags for internal discovery.",
  },
  category: {
    field: "category",
    fieldLabel: "Category",
    anchor: "post-category",
    autoFixable: false,
    where: "Sidebar → Category",
    how: "Assign a category to group and structure related content.",
  },
  slug: {
    field: "slug",
    fieldLabel: "URL slug",
    anchor: "post-slug",
    autoFixable: true,
    where: "Sidebar → Slug",
    how: "Use a lowercase, hyphenated slug under 60 characters.",
  },
};

export function fixGuideFor(issueId: string): FixGuide | null {
  return ISSUE_FIX_GUIDE[issueId] ?? null;
}

/** Issue ids the one-click auto-fixer can repair. */
export const AUTO_FIXABLE_FIELDS: PostField[] = [
  "meta_title",
  "meta_description",
  "title",
  "excerpt",
  "slug",
  "tags",
];

export function autoFixableIssues(issues: SeoIssue[]): SeoIssue[] {
  return issues.filter((i) => ISSUE_FIX_GUIDE[i.id]?.autoFixable);
}
