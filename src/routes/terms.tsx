import { createFileRoute, Link } from "@tanstack/react-router";
import { EditablePage, Prose, Section } from "@/components/content-page";

export const Route = createFileRoute("/terms")({
  head: () => {
    const title = "Terms of Service — Free Online Video Downloader";
    const description =
"The terms for using the Free Online Video Downloader free video downloader, including acceptable use, responsibilities, and disclaimers.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/terms" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/terms" }],
    };
  },
  component: Terms,
});

function Terms() {
  return (
    <EditablePage
      pageKey="terms"
      defaultEyebrow="Legal"
      defaultTitle="Terms of Service"
      defaultIntro="Please read these terms, maintained by the Free Online Video Downloader team, before using the service."
    >
      <Prose>
        <p className="text-sm">Last updated: July 2026</p>

        <Section title="1. Acceptance of terms">
          <p>
            By accessing or using Free Online Video Downloader, you agree to be bound by
            these terms. If you do not agree, please do not use the service.
          </p>
        </Section>

        <Section title="2. Description of the service">
          <p>
            Free Online Video Downloader is a free tool that helps you retrieve publicly
            accessible media from supported platforms for your personal use. We provide
            the tool &quot;as is&quot; and do not host, own, or control the content you
            download.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be able to form a legally binding agreement to use the service and
            must comply with all applicable laws in your location. If you use the tool
            on behalf of an organisation, you confirm you are authorised to do so.
          </p>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree that you will:</p>
          <ul>
            <li>Only download content you own or have permission to use.</li>
            <li>Respect the intellectual property rights of creators and rights holders.</li>
            <li>Comply with the terms of service of the source platforms.</li>
            <li>Use the service for lawful, personal, non-commercial purposes.</li>
          </ul>
        </Section>

        <Section title="5. Prohibited use">
          <p>You must not:</p>
          <ul>
            <li>Download private, paid, or copyright-protected content without permission.</li>
            <li>Redistribute, sell, or publicly share content you are not authorised to use.</li>
            <li>Use automated systems to overload, scrape, or disrupt the service.</li>
            <li>Use the tool for any unlawful, harmful, or infringing purpose.</li>
          </ul>
          <p>
            You are solely responsible for how you use downloaded content. See our{" "}
            <Link to="/dmca">copyright &amp; DMCA policy</Link> for reporting
            infringement.
          </p>
        </Section>

        <Section title="6. Intellectual property">
          <p>
            All content you access remains the property of its respective owners. Nothing
            in these terms transfers any ownership of that content to you, and using our
            tool does not grant you any rights you would not otherwise have.
          </p>
        </Section>

        <Section title="7. Third-party platforms">
          <p>
            The service interacts with third-party platforms that we do not control.
            Their terms and policies continue to apply to your use of their content, and
            we are not responsible for their availability or behaviour.
          </p>
        </Section>

        <Section title="8. Availability and changes">
          <p>
            We work to keep the service running smoothly, but we do not guarantee
            uninterrupted access. Features may change, and downloads may occasionally
            fail due to changes on source platforms.
          </p>
        </Section>

        <Section title="9. Disclaimer of warranties">
          <p>
            The service is provided without warranties of any kind, whether express or
            implied, including fitness for a particular purpose and non-infringement.
            You use the tool at your own risk.
          </p>
        </Section>

        <Section title="10. Limitation of liability">
          <p>
            To the fullest extent permitted by law, Free Online Video Downloader is not
            liable for any indirect, incidental, or consequential damages arising from
            your use of the service or of content you download.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to hold Free Online Video Downloader harmless from any claims or
            demands arising out of your misuse of the service or your violation of these
            terms or the rights of others.
          </p>
        </Section>

        <Section title="12. Changes to these terms">
          <p>
            We may update these terms at any time. Continued use of the service after
            changes means you accept the updated terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these terms? Use our <Link to="/contact">contact page</Link>.
          </p>
        </Section>
      </Prose>
    </EditablePage>
  );
}
