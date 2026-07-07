import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { EditablePage } from "@/components/content-page";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => {
    const title = "Contact Free Online Video Downloader — Support & Feedback";
    const description =
"Get in touch with the Free Online Video Downloader team for support, feedback, or copyright concerns about our free video downloader.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://freevideodownloader.lovable.app/contact" },
      ],
      links: [{ rel: "canonical", href: "https://freevideodownloader.lovable.app/contact" }],
    };
  },
  component: Contact,
});

function Contact() {
  const submit = useServerFn(sendContactMessage);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submit({ data: form });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <EditablePage
      pageKey="contact"
      defaultEyebrow="Contact"
      defaultTitle="Get in touch"
      defaultIntro="Have a question, a bug to report, or a copyright concern? Fill in the form below and we'll get back to you."
    >
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-border bg-card p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-accent" />
              <h2 className="mt-4 text-xl font-bold">Message sent!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks for reaching out. We&apos;ll get back to you as soon as we can.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  maxLength={2000}
                  rows={6}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring"
                  placeholder="How can we help?"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </EditablePage>
  );
}
