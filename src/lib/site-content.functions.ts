import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ContentValue, PublicSiteData, ToolSetting } from "@/lib/site-content";
import type { AdRow } from "@/lib/ads";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}

// ---------------- Public read ----------------

export const getPublicSiteData = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSiteData> => {
    const supabase = publicClient();
    const [contentRes, toolsRes, adsRes] = await Promise.all([
      supabase.from("site_content").select("key, content"),
      supabase.from("tool_settings").select("slug, enabled, name, tagline, description"),
      supabase.from("ads").select("placement, name, code, link_url, enabled").eq("enabled", true),
    ]);
    if (contentRes.error) throw new Error(contentRes.error.message);
    if (toolsRes.error) throw new Error(toolsRes.error.message);
    if (adsRes.error) throw new Error(adsRes.error.message);

    const content: Record<string, ContentValue> = {};
    for (const row of contentRes.data ?? []) {
      content[row.key] = (row.content as ContentValue) ?? {};
    }
    const tools = (toolsRes.data ?? []) as ToolSetting[];
    const ads = (adsRes.data ?? []) as AdRow[];
    return { content, tools, ads };
  },
);


// ---------------- Admin: site content ----------------

export const getSiteContentAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }): Promise<ContentValue> => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("site_content")
      .select("content")
      .eq("key", data.key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.content as ContentValue) ?? {};
  });

export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ key: z.string().min(1).max(60), content: z.record(z.string(), z.unknown()) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("site_content").upsert(
      {
        key: data.key,
        content: data.content as Database["public"]["Tables"]["site_content"]["Insert"]["content"],
        updated_by: context.userId,
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Admin: tool settings ----------------

export const listToolSettingsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ToolSetting[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("tool_settings")
      .select("slug, enabled, name, tagline, description");
    if (error) throw new Error(error.message);
    return (data ?? []) as ToolSetting[];
  });

export const saveToolSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        enabled: z.boolean(),
        name: z.string().max(80).nullable().optional(),
        tagline: z.string().max(160).nullable().optional(),
        description: z.string().max(400).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const clean = (v: string | null | undefined) => {
      const t = (v ?? "").trim();
      return t === "" ? null : t;
    };
    const { error } = await context.supabase.from("tool_settings").upsert(
      {
        slug: data.slug,
        enabled: data.enabled,
        name: clean(data.name),
        tagline: clean(data.tagline),
        description: clean(data.description),
        updated_by: context.userId,
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
