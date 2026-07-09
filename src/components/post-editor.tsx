import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  ImagePlus,
  X,
  Save,
  Eye,
  Search,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { savePost } from "@/lib/blog.functions";
import { slugify, excerptFromHtml } from "@/lib/blog-utils";
import { RichTextEditor } from "@/components/rich-text-editor";
import { AiAssist } from "@/components/ai-writer/ai-assist";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  author_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
};

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("blog-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
}

function Field({
  label,
  hint,
  id,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <label id={id} className="block scroll-mt-24 space-y-1.5 rounded-xl transition-shadow">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Scroll to and briefly highlight the editor field referenced by the URL hash. */
function useFocusHashField() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
      window.setTimeout(
        () => el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background"),
        2400,
      );
    }, 250);
    return () => window.clearTimeout(t);
  }, []);
}


const inputCls =
"w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

function counterColor(len: number, min: number, max: number) {
  if (len === 0) return "text-muted-foreground";
  if (len < min) return "text-amber-400";
  if (len > max) return "text-destructive";
  return "text-primary";
}

export function PostEditor({ post }: { post?: PostRow | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const save = useServerFn(savePost);
  useFocusHashField();


  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post?.slug);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [author, setAuthor] = useState(post?.author_name ?? "");
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (post?.status as "draft" | "published") ?? "draft",
  );
  const [coverUploading, setCoverUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (goToPost: boolean) =>
      save({
        data: {
          id: post?.id,
          title,
          slug,
          excerpt,
          content,
          featured_image: featuredImage,
          category,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          author_name: author,
          meta_title: metaTitle,
          meta_description: metaDescription,
          status,
        },
      }).then((res) => ({ res, goToPost })),
    onSuccess: ({ res, goToPost }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["published-posts"] });
      toast.success(post ? "Post updated" : "Post created");
      if (goToPost && res?.slug && status === "published") {
        navigate({ to: "/blog/$slug", params: { slug: res.slug } });
      } else {
        navigate({ to: "/admin" });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Could not save post"),
  });

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      setFeaturedImage(await uploadImage(file));
    } catch {
      toast.error("Image upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  const seoTitle = metaTitle || title || "Your post title";
  const seoDesc = metaDescription || excerpt || excerptFromHtml(content) || "Your meta description preview will appear here.";
  const seoUrl = `yourdomain.com › blog › ${slug || "post-slug"}`;

  const aiContext = [
    "This is a blog post for a free online video downloader website.",
    title ? `Post title: ${title}` : "",
    category ? `Category: ${category}` : "",
    tags ? `Tags: ${tags}` : "",
    excerpt ? `Excerpt: ${excerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(false);
      }}
      className="grid gap-6 lg:grid-cols-[1fr_340px]"
    >
      {/* Main column */}
      <div className="space-y-5">
        <Field
          label="Title"
          id="post-title"
          hint={
            <AiAssist
              fieldKind="title"
              value={title}
              onApply={onTitle}
              context={aiContext}
              label="post title"
            />
          }
        >
          <input
            className={`${inputCls} font-display text-lg`}
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="How to download videos on any device"
            required
          />
        </Field>

        <Field
          label="Excerpt"
          id="post-excerpt"
          hint={
            <AiAssist
              fieldKind="excerpt"
              value={excerpt}
              onApply={setExcerpt}
              context={aiContext}
              label="excerpt"
            />
          }
        >
          <textarea
            className={`${inputCls} min-h-[80px] resize-y`}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A one or two sentence teaser for this article."
          />
        </Field>

        <div id="post-content" className="scroll-mt-24 space-y-1.5 rounded-xl transition-shadow">
          <span className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Content</span>
            <AiAssist
              fieldKind="article"
              value={content}
              onApply={setContent}
              context={aiContext}
              label="article body (HTML)"
            />
          </span>
          <RichTextEditor value={content} onChange={setContent} onImageUpload={uploadImage} />
        </div>


        {/* Yoast-style SEO panel */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Search className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold">Search appearance</h3>
              <p className="text-xs text-muted-foreground">Control how this post looks on Google & social.</p>
            </div>
          </div>

          {/* Google preview */}
          <div className="mb-5 rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs text-emerald-400">{seoUrl}</p>
            <p className="mt-0.5 line-clamp-1 text-[1.05rem] font-medium text-primary">{seoTitle}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{seoDesc}</p>
          </div>

          <div className="space-y-4">
            <Field
              label="Meta title"
              id="seo-meta-title"
              hint={
                <span className="flex items-center gap-2">
                  <span className={counterColor(metaTitle.length, 15, 60)}>
                    {metaTitle.length}/60
                  </span>
                  <AiAssist
                    fieldKind="meta_title"
                    value={metaTitle}
                    onApply={setMetaTitle}
                    context={aiContext}
                    label="meta title"
                  />
                </span>
              }
            >
              <input
                className={inputCls}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "SEO title (defaults to post title)"}
              />
            </Field>
            <Field
              label="Meta description"
              id="seo-meta-description"
              hint={
                <span className="flex items-center gap-2">
                  <span className={counterColor(metaDescription.length, 70, 160)}>
                    {metaDescription.length}/160
                  </span>
                  <AiAssist
                    fieldKind="meta_description"
                    value={metaDescription}
                    onApply={setMetaDescription}
                    context={aiContext}
                    label="meta description"
                  />
                </span>
              }
            >
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="A compelling 1–2 sentence description for search engines."
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-bold">Publish</h3>
          </div>
          <Field label="Status">
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save post
            </button>
            {status === "published" && (
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                <Eye className="h-4 w-4" /> Save & view
              </button>
            )}
          </div>
        </div>

        <div id="featured-image" className="scroll-mt-24 space-y-3 rounded-2xl border border-border bg-card p-5 transition-shadow">
          <h3 className="font-display text-base font-bold">Featured image</h3>
          {featuredImage ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img src={featuredImage} alt="Blog post cover image preview" className="aspect-video w-full object-cover" />
              <button
                type="button"
                onClick={() => setFeaturedImage("")}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
              {coverUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
              <span>Upload cover image</span>
              <input type="file" accept="image/*" hidden onChange={onCover} />
            </label>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-base font-bold">Details</h3>
          <Field label="Slug" id="post-slug" hint="URL path">
            <input
              className={inputCls}
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="post-slug"
            />
          </Field>
          <Field label="Category" id="post-category">
            <input
              className={inputCls}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Guides"
            />
          </Field>
          <Field label="Tags" id="post-tags" hint="Comma separated">
            <input
              className={inputCls}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="youtube, tutorial"
            />
          </Field>

          <Field label="Author">
            <input
              className={inputCls}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </Field>
        </div>
      </aside>
    </form>
  );
}
