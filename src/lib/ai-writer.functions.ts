import { createServerFn } from "@tanstack/react-start";
import { type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/blog-utils";
import { presetFor, type AiProvider, type ConversationSummary, type ProviderType } from "@/lib/ai-writer";

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}

function maskKey(key: string): string {
  const tail = key.slice(-4);
  return `••••${tail}`;
}

const PROVIDER_TYPES: ProviderType[] = [
  "openai",
  "openrouter",
  "gemini",
  "deepseek",
  "claude",
  "custom",
];

// ---------------- Providers ----------------

export const listAiProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AiProvider[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("ai_providers")
      .select("id, name, provider_type, base_url, model, api_key, enabled, is_default")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      provider_type: row.provider_type as ProviderType,
      base_url: row.base_url,
      model: row.model,
      api_key_preview: maskKey(row.api_key ?? ""),
      enabled: row.enabled,
      is_default: row.is_default,
    }));
  });

const providerInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  provider_type: z.enum(["openai", "openrouter", "gemini", "deepseek", "claude", "custom"]),
  base_url: z.string().trim().max(500).optional().default(""),
  model: z.string().trim().min(1, "Model is required").max(200),
  // Empty string on edit = keep existing key
  api_key: z.string().trim().max(400).optional().default(""),
  enabled: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

export const saveAiProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => providerInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const preset = presetFor(data.provider_type);
    const base_url = (data.base_url?.trim() || preset.base_url).replace(/\/+$/, "");
    if (!base_url) throw new Error("A base URL is required for custom providers");

    // If this provider becomes default, clear other defaults first.
    if (data.is_default) {
      const { error: clrErr } = await context.supabase
        .from("ai_providers")
        .update({ is_default: false })
        .neq("id", data.id ?? "00000000-0000-0000-0000-000000000000");
      if (clrErr) throw new Error(clrErr.message);
    }

    if (data.id) {
      const patch: Database["public"]["Tables"]["ai_providers"]["Update"] = {
        name: data.name,
        provider_type: data.provider_type,
        base_url,
        model: data.model,
        enabled: data.enabled,
        is_default: data.is_default,
      };
      if (data.api_key) patch.api_key = data.api_key;
      const { error } = await context.supabase
        .from("ai_providers")
        .update(patch)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }

    if (!data.api_key) throw new Error("An API key is required");
    const { data: created, error } = await context.supabase
      .from("ai_providers")
      .insert({
        name: data.name,
        provider_type: data.provider_type,
        base_url,
        model: data.model,
        api_key: data.api_key,
        enabled: data.enabled,
        is_default: data.is_default,
        created_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true, id: created?.id };
  });

export const deleteAiProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("ai_providers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Conversations (24h) ----------------

async function cleanupExpired(context: { supabase: SupabaseClient<Database> }) {
  await context.supabase
    .from("ai_conversations")
    .delete()
    .lt("expires_at", new Date().toISOString());
}

export const listAiConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConversationSummary[]> => {
    await assertAdmin(context);
    await cleanupExpired(context);
    const { data, error } = await context.supabase
      .from("ai_conversations")
      .select("id, title, updated_at, expires_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ConversationSummary[];
  });

export const getAiConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await cleanupExpired(context);
    const { data: row, error } = await context.supabase
      .from("ai_conversations")
      .select("id, title, messages")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const saveAiConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().max(120).optional().default("New chat"),
        messages: z.array(z.unknown()).max(400),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await cleanupExpired(context);
    const messages = data.messages as Database["public"]["Tables"]["ai_conversations"]["Insert"]["messages"];
    if (data.id) {
      const { error } = await context.supabase
        .from("ai_conversations")
        .update({ title: data.title || "New chat", messages })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: created, error } = await context.supabase
      .from("ai_conversations")
      .insert({ title: data.title || "New chat", messages, created_by: context.userId })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: created?.id };
  });

export const deleteAiConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("ai_conversations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Publishing ----------------

/** Split markdown into { heading, body } sections by top-level ## headings. */
function markdownToSections(md: string): { a: string; b: string }[] {
  const lines = md.split("\n");
  const sections: { a: string; b: string }[] = [];
  let current: { a: string; b: string } | null = null;
  for (const line of lines) {
    const h = line.match(/^#{2,3}\s+(.*)$/);
    if (h) {
      if (current) sections.push(current);
      current = { a: h[1].trim(), b: "" };
    } else {
      if (!current) current = { a: "", b: "" };
      current.b += (current.b ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);
  return sections
    .map((s) => ({ a: s.a, b: s.b.trim() }))
    .filter((s) => s.a || s.b);
}

const publishInput = z.object({
  target: z.enum(["new_post", "existing_post", "page"]),
  markdown: z.string().min(1, "There is nothing to publish"),
  // posts
  postId: z.string().uuid().optional(),
  title: z.string().trim().max(200).optional().default(""),
  slug: z.string().trim().max(200).optional().default(""),
  excerpt: z.string().trim().max(500).optional().default(""),
  category: z.string().trim().max(100).optional().default(""),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  // page
  pageKey: z.string().trim().max(60).optional().default(""),
});

export const publishFromAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => publishInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { marked } = await import("marked");
    const html = await marked.parse(data.markdown, { async: true });

    if (data.target === "page") {
      if (!data.pageKey) throw new Error("Select a page to update");
      const sections = markdownToSections(data.markdown);
      const { data: existing } = await context.supabase
        .from("site_content")
        .select("content")
        .eq("key", data.pageKey)
        .maybeSingle();
      const prev = (existing?.content as Record<string, unknown> | null) ?? {};
      const content = {
        ...prev,
        ...(data.title ? { title: data.title } : {}),
        ...(data.excerpt ? { intro: data.excerpt } : {}),
        sections,
      };
      const { error } = await context.supabase.from("site_content").upsert(
        {
          key: data.pageKey,
          content: content as Database["public"]["Tables"]["site_content"]["Insert"]["content"],
          updated_by: context.userId,
        },
        { onConflict: "key" },
      );
      if (error) throw new Error(error.message);
      return { ok: true, target: "page", pageKey: data.pageKey };
    }

    // posts
    const title = data.title || "Untitled article";
    const slug = slugify(data.slug || title);
    if (!slug) throw new Error("A valid title or slug is required");

    const base = {
      title,
      slug,
      excerpt: data.excerpt || null,
      content: html,
      category: data.category || null,
      status: data.status,
    };

    if (data.target === "existing_post") {
      if (!data.postId) throw new Error("Select a post to update");
      const { data: existing } = await context.supabase
        .from("posts")
        .select("published_at")
        .eq("id", data.postId)
        .maybeSingle();
      const published_at =
        data.status === "published"
          ? existing?.published_at ?? new Date().toISOString()
          : existing?.published_at ?? null;
      const { data: updated, error } = await context.supabase
        .from("posts")
        .update({ ...base, published_at })
        .eq("id", data.postId)
        .select("id, slug")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { ok: true, target: "existing_post", id: updated?.id, slug: updated?.slug };
    }

    const published_at = data.status === "published" ? new Date().toISOString() : null;
    const { data: created, error } = await context.supabase
      .from("posts")
      .insert({ ...base, published_at, created_by: context.userId })
      .select("id, slug")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true, target: "new_post", id: created?.id, slug: created?.slug };
  });

// PROVIDER_TYPES export kept for potential future validation reuse
export const _providerTypes = PROVIDER_TYPES;
