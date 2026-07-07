import { platforms, type Platform } from "@/lib/platforms";
import type { AdRow } from "@/lib/ads";

// ---------------- Types ----------------

export type ToolSetting = {
  slug: string;
  enabled: boolean;
  name: string | null;
  tagline: string | null;
  description: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentValue = Record<string, any>;
export type SiteContentMap = Record<string, ContentValue>;
export type ToolSettingMap = Record<string, ToolSetting>;

export type PublicSiteData = {
  content: SiteContentMap;
  tools: ToolSetting[];
  ads: AdRow[];
};

export type FieldType = "text" | "textarea" | "pairs";

export type Field = {
  id: string;
  label: string;
  type: FieldType;
  help?: string;
  /** For "pairs" fields: the two sub-field keys + labels. */
  keyA?: string;
  keyB?: string;
  labelA?: string;
  labelB?: string;
  multilineB?: boolean;
};

export type PageDef = {
  key: string;
  label: string;
  description: string;
  /** When true the page always renders from these values (home/branding). */
  dataDriven: boolean;
  fields: Field[];
  defaults: ContentValue;
};

// ---------------- Tool resolution ----------------

export type ResolvedPlatform = Platform & { enabled: boolean };

export function resolvePlatforms(settings: ToolSettingMap): ResolvedPlatform[] {
  return platforms.map((p) => {
    const s = settings[p.slug];
    return {
      ...p,
      name: (s?.name && s.name.trim()) || p.name,
      tagline: (s?.tagline && s.tagline.trim()) || p.tagline,
      description: (s?.description && s.description.trim()) || p.description,
      enabled: s?.enabled ?? true,
    };
  });
}

export function enabledPlatforms(settings: ToolSettingMap): ResolvedPlatform[] {
  return resolvePlatforms(settings).filter((p) => p.enabled);
}

export function toolSettingMap(list: ToolSetting[]): ToolSettingMap {
  return Object.fromEntries(list.map((t) => [t.slug, t]));
}

// ---------------- Content merge ----------------

/** Merge saved overrides on top of page defaults. Empty strings fall back. */
export function mergeContent(key: string, override: ContentValue | undefined | null): ContentValue {
  const def = PAGE_DEFS.find((p) => p.key === key);
  const base = def ? def.defaults : {};
  const merged: ContentValue = { ...base };
  if (override) {
    for (const [k, v] of Object.entries(override)) {
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      if (Array.isArray(v) && v.length === 0) continue;
      merged[k] = v;
    }
  }
  return merged;
}

export function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export type Pair = { a: string; b: string };

export function pairs(v: unknown): Pair[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object")
    .map((x) => {
      const o = x as Record<string, unknown>;
      return { a: str(o.a), b: str(o.b) };
    });
}

// ---------------- Page definitions ----------------

export const PAGE_DEFS: PageDef[] = [
  {
    key: "branding",
    label: "Site branding",
    description: "Site name and footer text used across the whole site.",
    dataDriven: true,
    fields: [
      { id: "siteName", label: "Site name", type: "text" },
      { id: "footerTagline", label: "Footer tagline", type: "textarea" },
      { id: "supportEmail", label: "Support email", type: "text" },
    ],
    defaults: {
      siteName: "Free Online Video Downloader",
      footerTagline:
        "Fast, free video & audio downloads from your favourite platforms — no sign-up, no clutter.",
      supportEmail: "support@snagvid.app",
    },
  },
  {
    key: "home",
    label: "Homepage",
    description: "Hero, section headings and homepage FAQ.",
    dataDriven: true,
    fields: [
      { id: "seoTitle", label: "SEO title", type: "text" },
      { id: "seoDescription", label: "SEO description", type: "textarea" },
      { id: "badge", label: "Top badge", type: "text" },
      { id: "heroTitle", label: "Hero title", type: "text" },
      { id: "heroTitleAccent", label: "Hero title (accent line)", type: "text" },
      { id: "heroSubtitle", label: "Hero subtitle", type: "textarea" },
      { id: "ctaHeading", label: "Hero CTA heading", type: "text" },
      { id: "ctaSubheading", label: "Hero CTA subheading", type: "text" },
      { id: "ctaButton", label: "Hero CTA button", type: "text" },
      { id: "platformsHeading", label: "Platforms heading", type: "text" },
      { id: "platformsSubtext", label: "Platforms subtext", type: "textarea" },
      { id: "howHeading", label: "How it works heading", type: "text" },
      { id: "howSubtext", label: "How it works subtext", type: "textarea" },
      { id: "steps", label: "How it works steps", type: "pairs", keyA: "a", keyB: "b", labelA: "Title", labelB: "Text", multilineB: true },
      { id: "whyHeading", label: "Why use heading", type: "text" },
      { id: "whySubtext", label: "Why use subtext", type: "textarea" },
      { id: "features", label: "Feature cards", type: "pairs", keyA: "a", keyB: "b", labelA: "Title", labelB: "Text", multilineB: true },
      { id: "faqHeading", label: "FAQ heading", type: "text" },
      { id: "faqs", label: "FAQ items", type: "pairs", keyA: "a", keyB: "b", labelA: "Question", labelB: "Answer", multilineB: true },
      { id: "finalCtaHeading", label: "Final CTA heading", type: "text" },
      { id: "finalCtaSubtext", label: "Final CTA subtext", type: "textarea" },
      { id: "finalCtaButton", label: "Final CTA button", type: "text" },
    ],
    defaults: {
      seoTitle: "Free Online Video Downloader for All Platforms",
      seoDescription:
        "Download supported public videos from YouTube, TikTok, Instagram, Facebook, X, Reddit, Snapchat, SoundCloud, CapCut, SnackVideo and Douyin. Fast, free, no sign-up.",
      badge: "11 platforms · one downloader",
      heroTitle: "Free Online Video Downloader",
      heroTitleAccent: "for All Platforms",
      heroSubtitle:
        "Download supported public videos from YouTube, TikTok, Instagram, Facebook, X, Reddit, Snapchat, SoundCloud, CapCut, SnackVideo and Douyin by pasting a link.",
      ctaHeading: "Pick your platform below to start",
      ctaSubheading: "Instant, high-quality downloads — no sign-up required.",
      ctaButton: "Choose a platform",
      platformsHeading: "Download videos from popular platforms",
      platformsSubtext: "Tap a platform, paste your link and download in seconds.",
      howHeading: "How it works",
      howSubtext: "A simple, trustworthy process that stays easy for beginners.",
      steps: [
        { a: "Copy the video link", b: "Open the app or site, tap Share, and copy the link of the public video you want to save." },
        { a: "Pick a platform & paste", b: "Choose the matching platform tile below, then paste your link into its downloader." },
        { a: "Download the video", b: "Preview the available quality and download the file straight to your device." },
      ],
      whyHeading: "Why use our video downloader?",
      whySubtext: "Built to be fast, private and effortless on any device.",
      features: [
        { a: "Fast online downloading", b: "Quick processing with no waiting queues." },
        { a: "No software to install", b: "Works right in your browser — nothing to set up." },
        { a: "Supports many platforms", b: "One tool for 11+ popular video and audio sites." },
        { a: "MP4 & HD when available", b: "Grab the best quality each source allows." },
        { a: "Mobile & desktop friendly", b: "A responsive experience on any screen." },
        { a: "Simple & secure", b: "Clean, ad-light pages with no shady redirects." },
        { a: "No registration required", b: "No account, no email — just paste and go." },
        { a: "Browser-based tool", b: "Nothing stored on your device beyond your file." },
      ],
      faqHeading: "Frequently asked questions",
      faqs: [
        { a: "Is this video downloader free?", b: "Yes. Every supported platform downloader is completely free to use with no hidden charges or sign-up." },
        { a: "How do I download a video from a link?", b: "Copy the public video link, open the matching platform tile, paste the link, and download the file." },
        { a: "Does it work on mobile?", b: "Yes. The tool is fully responsive and works on Android, iPhone, tablets and desktop browsers." },
        { a: "Can I download private videos?", b: "No. Only public videos you have permission to save can be downloaded. Private or protected content is not supported." },
        { a: "Is it safe to use?", b: "The site is browser-based and does not require any installation or account. Always download only content you own or are allowed to save." },
        { a: "Which platforms are supported?", b: "YouTube, TikTok, Instagram, Facebook, X, Reddit, Snapchat, SoundCloud, CapCut, SnackVideo and Douyin." },
      ],
      finalCtaHeading: "Ready to save your videos?",
      finalCtaSubtext:
        "Pick your platform, paste a public link, and download in seconds — free, fast, and no sign-up required.",
      finalCtaButton: "Choose a platform",
    },
  },
  contentPage("about", "About page", "About us", "Downloading, made effortless"),
  contentPage("how-to-download", "How it works page", "Guide", "How to download videos"),
  contentPage("faq", "FAQ page", "FAQ", "Frequently asked questions"),
  contentPage("contact", "Contact page", "Contact", "Get in touch"),
  contentPage("privacy", "Privacy Policy", "Legal", "Privacy Policy"),
  contentPage("terms", "Terms of Service", "Legal", "Terms of Service"),
  contentPage("dmca", "Copyright / DMCA", "Legal", "Copyright & DMCA"),
];

function contentPage(key: string, label: string, eyebrow: string, title: string): PageDef {
  return {
    key,
    label,
    description: "Header text and optional custom body sections. Leave blank to keep the built-in content.",
    dataDriven: false,
    fields: [
      { id: "eyebrow", label: "Eyebrow (small label)", type: "text", help: "Leave blank to keep the built-in text." },
      { id: "title", label: "Page title", type: "text", help: "Leave blank to keep the built-in text." },
      { id: "intro", label: "Intro paragraph", type: "textarea", help: "Leave blank to keep the built-in text." },
      {
        id: "sections",
        label: "Custom body sections",
        type: "pairs",
        keyA: "a",
        keyB: "b",
        labelA: "Section heading",
        labelB: "Section body",
        multilineB: true,
        help: "If you add any section here, it REPLACES the built-in page body. Leave empty to keep the built-in body.",
      },
    ],
    defaults: {
      eyebrow: "",
      title: "",
      intro: "",
      sections: [],
      _eyebrowDefault: eyebrow,
      _titleDefault: title,
    },
  };
}

export function pageDef(key: string): PageDef | undefined {
  return PAGE_DEFS.find((p) => p.key === key);
}
