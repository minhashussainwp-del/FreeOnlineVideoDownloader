import { createFileRoute, Link } from "@tanstack/react-router";
import { EditablePage } from "@/components/content-page";

export const Route = createFileRoute("/faq")({
  head: () => {
    const title = "FAQ — Free Online Video Downloader";
    const description =
"Answers to common questions about downloading videos and audio with Free Online Video Downloader: quality, cost, safety, supported platforms and more.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/faq" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/faq" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
"@context": "https://schema.org",
"@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
"@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: Faq,
});

const faqs = [
  {
    q: "Is Free Online Video Downloader free to use?",
    a: "Yes. Free Online Video Downloader is completely free with no sign-up, no subscription, and no hidden limits.",
  },
  {
    q: "Do I need to install an app or extension?",
    a: "No. Free Online Video Downloader runs entirely in your browser on any phone, tablet, or computer. Just paste a link and download.",
  },
  {
    q: "Which platforms are supported?",
    a: "YouTube, TikTok, Instagram, Facebook, Twitter/X, Reddit, Snapchat, SoundCloud, CapCut, SnackVideo and Douyin. Each has its own dedicated downloader page.",
  },
  {
    q: "Can I download just the audio?",
    a: "For platforms that provide a separate audio track (like YouTube, TikTok and SoundCloud), you'll see an 'Audio only' button on the results card.",
  },
  {
    q: "What video quality will I get?",
    a: "We fetch the highest quality the source makes available. When multiple qualities are offered, you can pick from the list under the video.",
  },
  {
    q: "Why did my link fail?",
    a: "Private, age-restricted, region-locked, or deleted content usually can't be downloaded. Double-check the link is public and try copying it again directly from the app.",
  },
  {
    q: "Do you store my videos or links?",
    a: "No. We don't keep the links you paste or the files you download. Your activity stays yours.",
  },
  {
    q: "Is it legal to download videos?",
    a: "Downloading content you own or have permission to use is generally fine. Downloading copyrighted content without permission may not be. Always respect creators and each platform's terms.",
  },
];

function Faq() {
  return (
    <EditablePage
      pageKey="faq"
      defaultEyebrow="Help center"
      defaultTitle="Frequently asked questions"
      defaultIntro="Everything you need to know about downloading with Free Online Video Downloader."
    >
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">{f.q}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card/60 p-6 text-center">
        <p className="text-muted-foreground">
          Still stuck? Head over to our{" "}
          <Link to="/contact" className="font-medium text-primary underline">
            contact page
          </Link>{" "}
          and we&apos;ll help you out.
        </p>
      </div>
    </EditablePage>
  );
}
