import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    // Persist every submission so nothing is lost.
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) throw new Error(error.message);

    // Attempt to forward the message to the private inbox. The recipient is
    // kept server-side only and never exposed to the browser.
    try {
      await forwardToInbox(data);
    } catch {
      // Delivery is best-effort; the message is already stored safely above.
    }

    return { ok: true };
  });

// Recipient stays on the server; it is never sent to the client bundle.
const INBOX_EMAIL = "minhashussain.wp@gmail.com";

async function forwardToInbox(data: { name: string; email: string; message: string }) {
  const resendKey = process.env.RESEND_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  // Only send when a Resend connection is available; otherwise the DB row is
  // the source of truth until email delivery is configured.
  if (!resendKey || !lovableKey) return;

  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: "Contact form <onboarding@resend.dev>",
      to: [INBOX_EMAIL],
      reply_to: data.email,
      subject: `New contact message from ${data.name}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Email delivery failed [${res.status}]: ${body}`);
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
