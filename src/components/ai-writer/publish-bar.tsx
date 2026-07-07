import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { publishFromAi } from "@/lib/ai-writer.functions";
import { listAllPostsAdmin } from "@/lib/blog.functions";
import { PAGE_DEFS } from "@/lib/site-content";

type Target = "new_post" | "existing_post" | "page";

export function PublishBar({ markdown }: { markdown: string }) {
  const publishFn = useServerFn(publishFromAi);
  const listPostsFn = useServerFn(listAllPostsAdmin);

  const [target, setTarget] = useState<Target>("new_post");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [postId, setPostId] = useState("");
  const [pageKey, setPageKey] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: posts } = useQuery({
    queryKey: ["admin-posts-for-ai"],
    queryFn: () => listPostsFn(),
  });

  // Derive a suggested title from the first heading of the markdown.
  const suggestedTitle = useMemo(() => {
    const m = markdown.match(/^#{1,3}\s+(.+)$/m);
    return m ? m[1].trim() : "";
  }, [markdown]);

  const publish = useMutation({
    mutationFn: () =>
      publishFn({
        data: {
          target,
          markdown,
          title: title || suggestedTitle,
          slug,
          excerpt,
          category,
          status,
          postId: target === "existing_post" ? postId : undefined,
          pageKey: target === "page" ? pageKey : undefined,
        },
      }),
    onSuccess: (res) => {
      setError(null);
      setDone(
        res.target === "page"
          ? "Page updated."
          : status === "published"
            ? "Published successfully."
            : "Saved as draft.",
      );
    },
    onError: (e: unknown) => {
      setDone(null);
      setError(e instanceof Error ? e.message : "Failed to publish");
    },
  });

  const disabled = !markdown.trim() || publish.isPending;
  const contentPages = PAGE_DEFS.filter((p) => !p.dataDriven);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-bold">Publish this content</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Where</span>
          <select
            value={target}
            onChange={(e) => {
              setTarget(e.target.value as Target);
              setDone(null);
            }}
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
          >
            <option value="new_post">New blog post</option>
            <option value="existing_post">Update existing post</option>
            <option value="page">Update a page</option>
          </select>
        </label>

        {target === "existing_post" && (
          <label className="text-sm">
            <span className="mb-1 block font-medium">Which post</span>
            <select
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Select a post…</option>
              {(posts ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
          </label>
        )}

        {target === "page" && (
          <label className="text-sm">
            <span className="mb-1 block font-medium">Which page</span>
            <select
              value={pageKey}
              onChange={(e) => setPageKey(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Select a page…</option>
              {contentPages.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {target !== "page" && (
          <>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={suggestedTitle || "Article title"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Slug (optional)</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from title"
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Category (optional)</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              >
                <option value="draft">Save as draft</option>
                <option value="published">Publish now</option>
              </select>
            </label>
          </>
        )}

        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">
            {target === "page" ? "Page intro (optional)" : "Excerpt / summary (optional)"}
          </span>
          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary"
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {done && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" /> {done}
        </p>
      )}

      <button
        onClick={() => publish.mutate()}
        disabled={disabled}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {target === "page" ? "Update page" : status === "published" ? "Publish" : "Save draft"}
      </button>
      {!markdown.trim() && (
        <p className="mt-2 text-xs text-muted-foreground">
          Generate an article in the chat first — the latest AI reply will be published.
        </p>
      )}
    </div>
  );
}
