import { createFileRoute, Link } from "@tanstack/react-router";
import { EditablePage, Prose, Section } from "@/components/content-page";

export const Route = createFileRoute("/dmca")({
  head: () => {
    const title = "Copyright & DMCA Policy — Free Online Video Downloader";
    const description =
      "How to report copyright concerns to Free Online Video Downloader. We respect intellectual property rights and respond to valid notices.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Dmca,
});

function Dmca() {
  return (
    <EditablePage
      pageKey="dmca"
      defaultEyebrow="Legal"
      defaultTitle="Copyright & DMCA"
      defaultIntro="Free Online Video Downloader respects the rights of creators and rights holders. This page explains our position and how to raise a concern."
    >
      <Prose>
        <p className="text-sm">Last updated: July 2026</p>

        <Section title="Our role">
          <p>
            Free Online Video Downloader is a tool that helps users retrieve publicly
            available media. We do not host, store, or own the videos and audio that
            pass through the service. Content remains on the source platforms and their
            content delivery networks.
          </p>
        </Section>

        <Section title="Your responsibility">
          <p>
            Users must only download content they own or are authorised to use.
            Downloading or redistributing copyrighted material without permission is
            prohibited under our <Link to="/terms">terms of service</Link>.
          </p>
        </Section>

        <Section title="How to file a copyright notice">
          <p>
            If you believe your rights are being infringed through the use of our tool,
            please send a notice through our <Link to="/contact">contact page</Link>. To
            help us act quickly, include the following:
          </p>
          <ul>
            <li>Your full name, contact details, and relationship to the work.</li>
            <li>A clear description of the copyrighted work involved.</li>
            <li>The specific link(s) or content at issue.</li>
            <li>
              A statement, made in good faith, that the use is not authorised by you,
              your agent, or the law.
            </li>
            <li>
              A statement that the information in your notice is accurate, and an
              electronic or physical signature of the rights holder or authorised agent.
            </li>
          </ul>
        </Section>

        <Section title="Counter-notification">
          <p>
            If you believe content was wrongly restricted, you may submit a
            counter-notice with your contact details, identification of the material,
            and a good-faith statement that it was restricted by mistake or
            misidentification. We will review counter-notices fairly.
          </p>
        </Section>

        <Section title="Repeat infringers">
          <p>
            We take repeated or clearly abusive infringement seriously and may take
            appropriate action where it is within our control to do so.
          </p>
        </Section>

        <Section title="What happens next">
          <p>
            We review valid notices and take appropriate action, which may include
            restricting access to specific sources where feasible. Because we do not host
            the underlying content, some concerns may need to be raised directly with the
            source platform that stores the material.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            To submit a notice or ask a question about copyright, please use our{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </Section>
      </Prose>
    </EditablePage>
  );
}
