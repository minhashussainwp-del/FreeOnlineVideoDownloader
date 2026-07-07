import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardPaste,
  MousePointerClick,
  Download,
  Sparkles,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { EditablePage } from "@/components/content-page";
import { platforms } from "@/lib/platforms";
import { PlatformIcon } from "@/lib/platform-icons";

export const Route = createFileRoute("/how-to-download")({
  head: () => {
    const title = "How to Download Videos — Free Online Video Downloader";
    const description =
"Learn how to download videos and audio in three simple steps with Free Online Video Downloader. A quick guide, pro tips, and fixes that work for every supported platform.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/how-to-download" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/how-to-download" }],
    };
  },
  component: HowTo,
});

const steps = [
  {
    icon: ClipboardPaste,
    title: "1. Copy the video link",
    text: "Open the app or website, tap the share icon on the video, and choose 'Copy link'. On desktop, copy the URL straight from your browser's address bar.",
  },
  {
    icon: MousePointerClick,
    title: "2. Paste it into the downloader",
    text: "Open the downloader page for that platform, paste the link into the box, and press Download. We instantly fetch the available media for you.",
  },
  {
    icon: Download,
    title: "3. Save your file",
    text: "Pick your preferred quality (or 'Audio only' where available) and the download begins. That's it — the file is yours to keep offline.",
  },
];

const tips = [
"Copy the link directly from the app's share menu for the most reliable results.",
"Make sure the video is public — private and restricted posts can't be fetched.",
"On mobile, downloaded files usually appear in your Downloads folder or gallery.",
"For music and podcasts, choose the 'Audio only' option to save an MP3 or M4A.",
];

const fixes = [
"Double-check the link is complete and hasn't been shortened or cut off.",
"Re-copy the link from the original app rather than a forwarded message.",
"Confirm the content isn't private, age-restricted, region-locked, or deleted.",
"Refresh the page and try again — source platforms occasionally change formats.",
];

function HowTo() {
  return (
    <EditablePage
      pageKey="how-to-download"
      defaultEyebrow="Step-by-step guide"
      defaultTitle="How to download a video"
      defaultIntro="It takes three steps and less than ten seconds. Here's exactly how it works, plus tips for the best results."
    >
      <div className="space-y-5">
        {steps.map((s) => (
          <div
            key={s.title}
            className="flex gap-5 rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{s.title}</h2>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <Lightbulb className="h-5 w-5 text-primary" /> Tips for the best results
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {tips.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <AlertTriangle className="h-5 w-5 text-primary" /> If a download fails
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {fixes.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Please download responsibly.</span>{" "}
        Only save content you own or have permission to use, and respect each
        platform&apos;s terms of service.
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-3 flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5 text-primary" /> Pick your platform
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <Link
              key={p.slug}
              to="/$platform"
              params={{ platform: p.slug }}
              style={{ ["--brand" as string]: p.color }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-brand/50 hover:bg-secondary"
            >
              <PlatformIcon slug={p.slug} className="h-3.5 w-3.5 text-brand" /> {p.name}
            </Link>
          ))}
        </div>
      </div>
    </EditablePage>
  );
}
