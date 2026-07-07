import { createFileRoute, Link } from "@tanstack/react-router";
import { EditablePage, Prose, Section } from "@/components/content-page";
import { platforms } from "@/lib/platforms";

export const Route = createFileRoute("/about")({
  head: () => {
    const title = "About Us — Free Online Video Downloader";
    const description =
      "Free Online Video Downloader is a fast, free tool to download videos and audio from 11+ platforms with no sign-up. Learn who we are, what we value, and how it works.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/about" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/about" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Free Online Video Downloader",
            url: "https://freevideodownloader.lovable.app",
            description:
              "A fast, free, browser-based tool to download public videos and audio from 11+ platforms with no sign-up.",
          }),
        },
      ],
    };
  },
  component: About,
});

function About() {
  return (
    <EditablePage
      pageKey="about"
      defaultEyebrow="About us"
      defaultTitle="Downloading, made effortless"
      defaultIntro="Free Online Video Downloader helps people everywhere save the videos and sounds they love — quickly, cleanly, and completely free."
    >
      <Prose>
        <Section title="Who we are">
          <p>
            Free Online Video Downloader is a lightweight, browser-based tool built
            by a small team that was tired of cluttered download sites. There are no
            fake buttons, no forced sign-ups, and no confusing steps — just a simple
            way to save public videos and audio from the platforms you already use.
          </p>
        </Section>

        <Section title="Our mission">
          <p>
            We believe saving a clip you&apos;re allowed to keep shouldn&apos;t mean
            fighting through pop-ups, misleading ads, and endless redirects. Our goal
            is to make offline access to media honest and effortless: paste a link,
            choose your quality, and you&apos;re done — no account, no app, no clutter.
          </p>
        </Section>

        <Section title="What we support">
          <p>
            Free Online Video Downloader works across {platforms.length} of the
            biggest platforms, each with its own dedicated downloader page:
          </p>
          <ul>
            {platforms.map((p) => (
              <li key={p.slug}>
                <Link to="/$platform" params={{ platform: p.slug }}>
                  {p.name}
                </Link>{" "}
                — {p.tagline.toLowerCase()}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How it works">
          <p>
            The process is designed for beginners. Copy a public video link, open the
            matching platform page, paste the link, and download. If you&apos;d like a
            walkthrough, our{" "}
            <Link to="/how-to-download">step-by-step guide</Link> covers everything in
            under a minute.
          </p>
        </Section>

        <Section title="What we stand for">
          <ul>
            <li>Fast, high-quality downloads with no watermarks where possible.</li>
            <li>Completely free — no sign-up, no subscription, no hidden limits.</li>
            <li>Privacy first: we don&apos;t store the links you paste or the files you download.</li>
            <li>Works on any device, straight from your browser.</li>
          </ul>
        </Section>

        <Section title="Responsible use">
          <p>
            Free Online Video Downloader is built for saving content you own or have
            permission to use. Please respect creators and each platform&apos;s terms
            of service. For details, see our{" "}
            <Link to="/dmca">copyright &amp; DMCA policy</Link>,{" "}
            <Link to="/terms">terms of service</Link>, and{" "}
            <Link to="/privacy">privacy policy</Link>.
          </p>
        </Section>

        <Section title="Get in touch">
          <p>
            Have feedback, a feature request, or a question? We&apos;d genuinely love
            to hear it — reach us any time through our{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </Section>
      </Prose>
    </EditablePage>
  );
}
