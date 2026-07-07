import { createServerFn } from "@tanstack/react-start";
import { type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AdRow } from "@/lib/ads";

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}

const PLACEMENTS = ["top", "bottom", "left", "right", "download"] as const;

// ---------------- Admin: list all ads ----------------

export const getAdsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdRow[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("ads")
      .select("placement, name, code, link_url, enabled");
    if (error) throw new Error(error.message);
    return (data ?? []) as AdRow[];
  });

// ---------------- Admin: create / update one placement ----------------

export const saveAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        placement: z.enum(PLACEMENTS),
        name: z.string().max(120).nullable().optional(),
        code: z.string().max(20000).nullable().optional(),
        link_url: z.string().max(2000).nullable().optional(),
        enabled: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("ads").upsert(
      {
        placement: data.placement,
        name: data.name ?? null,
        code: data.code ?? null,
        link_url: data.link_url ?? null,
        enabled: data.enabled,
        updated_by: context.userId,
      },
      { onConflict: "placement" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
