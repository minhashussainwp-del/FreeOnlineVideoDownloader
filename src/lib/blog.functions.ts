import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/blog-utils";

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

const LIST_COLUMNS =
  "id, title, slug, excerpt, featured_image, category, tags, author_name, published_at";

// ---------- Public reads ----------

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublishedPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

// ---------- Admin bootstrap / access ----------

export const ensureAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error(error.message);

    if (!count) {
      // Bootstrap guard: never "first caller wins". Only a pre-approved,
      // email-verified account may claim the initial admin role.
      const approvedEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
      if (!approvedEmail) {
        throw new Error("Admin bootstrap is not configured");
      }

      // Verify identity + email confirmation via the admin API (authoritative),
      // not on JWT claim shape.
      const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.getUserById(
        context.userId,
      );
      if (userErr) throw new Error(userErr.message);

      const callerEmail = userRes.user?.email?.trim().toLowerCase() ?? "";
      const emailVerified = !!userRes.user?.email_confirmed_at;

      if (!callerEmail || callerEmail !== approvedEmail || !emailVerified) {
        return { isAdmin: false, becameAdmin: false };
      }


      const { error: insErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "admin" });
      if (insErr) throw new Error(insErr.message);
      return { isAdmin: true, becameAdmin: true };
    }


    const { data, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);

    return { isAdmin: !!data, becameAdmin: false };
  });

// ---------- Admin reads ----------

export const listAllPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("posts")
      .select("id, title, slug, status, category, published_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPostByIdAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: post, error } = await context.supabase
      .from("posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

// ---------- Admin writes ----------

const postInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z.string().trim().max(200).optional().default(""),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z.string().optional().default(""),
  featured_image: z.string().trim().max(1000).optional().default(""),
  category: z.string().trim().max(100).optional().default(""),
  tags: z.array(z.string().trim().max(50)).max(30).optional().default([]),
  author_name: z.string().trim().max(120).optional().default(""),
  meta_title: z.string().trim().max(120).optional().default(""),
  meta_description: z.string().trim().max(320).optional().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => postInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const slug = slugify(data.slug || data.title);
    if (!slug) throw new Error("A valid title or slug is required");

    const base = {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content ?? "",
      featured_image: data.featured_image || null,
      category: data.category || null,
      tags: data.tags ?? [],
      author_name: data.author_name || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      status: data.status,
    };

    if (data.id) {
      const { data: existing } = await context.supabase
        .from("posts")
        .select("published_at")
        .eq("id", data.id)
        .maybeSingle();
      const published_at =
        data.status === "published"
          ? existing?.published_at ?? new Date().toISOString()
          : existing?.published_at ?? null;

      const { data: updated, error } = await context.supabase
        .from("posts")
        .update({ ...base, published_at })
        .eq("id", data.id)
        .select("id, slug")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return updated;
    }

    const published_at = data.status === "published" ? new Date().toISOString() : null;
    const { data: created, error } = await context.supabase
      .from("posts")
      .insert({ ...base, published_at, created_by: context.userId })
      .select("id, slug")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return created;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
