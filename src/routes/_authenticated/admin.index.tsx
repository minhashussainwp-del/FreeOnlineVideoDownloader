import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Trash2, FileText, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { listAllPostsAdmin, deletePost } from "@/lib/blog.functions";
import { formatDate } from "@/lib/blog-utils";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPosts,
});

function AdminPosts() {
  const queryClient = useQueryClient();
  const listPosts = useServerFn(listAllPostsAdmin);
  const remove = useServerFn(deletePost);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => listPosts(),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["published-posts"] });
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">All posts</h1>
          <p className="text-sm text-muted-foreground">Manage your blog articles.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </span>
          <h2 className="font-display text-lg font-bold">No posts yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first article — add a title, content, and SEO meta tags.
          </p>
          <Link
            to="/admin/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-display text-sm font-bold text-primary-foreground"
          >
            <PlusCircle className="h-4 w-4" /> New post
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="divide-y divide-border">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{p.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
                        p.status === "published"
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {p.category ? `${p.category} · ` : ""}
                    {p.status === "published" && p.published_at
                      ? formatDate(p.published_at)
                      : `Updated ${formatDate(p.updated_at)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    to="/admin/$id"
                    params={{ id: p.id }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${p.title}"?`)) del.mutate(p.id);
                    }}
                    disabled={del.isPending}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
