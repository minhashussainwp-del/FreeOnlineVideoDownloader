import { createFileRoute, Link } from "@tanstack/react-router";
import { EditablePage, Prose, Section } from "@/components/content-page";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const title = "Privacy Policy — Free Online Video Downloader";
    const description =
"How Free Online Video Downloader handles your data when you use our free video downloader. This page is maintained by the Free Online Video Downloader team.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "index,follow" },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/privacy" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/privacy" }],
    };
  },
  component: Privacy,
});

function Privacy() {
  return (
    <EditablePage
      pageKey="privacy"
      defaultEyebrow="Legal"
      defaultTitle="Privacy Policy"
      defaultIntro="This page is maintained by the Free Online Video Downloader team to explain how our downloader handles your information."
    >
      <Prose>
        <p className="text-sm">Last updated: July 2026</p>

        <Section title="1. Introduction">
          <p>
            Your privacy matters to us. This policy describes what information Free
            Online Video Downloader processes when you use the service, why we process
            it, and the choices you have. By using the tool, you agree to the practices
            described here.
          </p>
        </Section>

        <Section title="2. Summary at a glance">
          <p>
            Free Online Video Downloader is designed to work without collecting personal
            information. You don&apos;t create an account to use it, and we don&apos;t
            store the links you paste or the files you download.
          </p>
        </Section>

        <Section title="3. Information we process">
          <ul>
            <li>
              <strong>Links you submit.</strong> When you paste a URL, it is sent to
              our download service only to fetch the requested media. It is used to
              complete your request and is not saved to a user profile.
            </li>
            <li>
              <strong>Basic technical data.</strong> Like most websites, our servers
              may temporarily process standard request data (such as IP address,
              device, and browser type) to operate the service, prevent abuse, and keep
              it secure.
            </li>
          </ul>
        </Section>

        <Section title="4. How we use information">
          <p>We use the limited data we process to:</p>
          <ul>
            <li>Retrieve the media you request and deliver your download.</li>
            <li>Keep the service secure and prevent misuse or automated abuse.</li>
            <li>Diagnose technical problems and improve reliability.</li>
          </ul>
          <p>
            We do not sell your personal information, and we do not build advertising
            profiles from your activity.
          </p>
        </Section>

        <Section title="5. Third-party services">
          <p>
            To retrieve media, Free Online Video Downloader relies on an upstream
            download provider and on the source platforms themselves (for example, the
            content delivery network hosting a video). Those services have their own
            privacy practices, which we do not control.
          </p>
        </Section>

        <Section title="6. Cookies and analytics">
          <p>
            We aim to keep tracking to a minimum. If analytics or cookies are added in
            the future to understand aggregate usage, this policy will be updated to
            describe them and any choices available to you.
          </p>
        </Section>

        <Section title="7. Data retention">
          <p>
            We do not maintain a database of your downloads. Operational logs, if any,
            are kept only for as long as needed to run and protect the service, then
            discarded.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We take reasonable technical and organisational measures to protect the
            information we process. No method of transmission over the internet is 100%
            secure, but we work to keep the service safe and dependable.
          </p>
        </Section>

        <Section title="9. Your choices">
          <p>
            Because we don&apos;t require accounts or store personal profiles, there is
            little data to manage. If you have a specific privacy request or question,
            contact us and we&apos;ll do our best to help.
          </p>
        </Section>

        <Section title="10. Children">
          <p>
            Free Online Video Downloader is not directed to children under 13, and we do
            not knowingly collect personal information from them.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be
            reflected by updating the date at the top of this page.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about privacy? Reach us through our{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </Section>
      </Prose>
    </EditablePage>
  );
}
