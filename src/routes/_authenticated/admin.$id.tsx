import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PostEditor } from "@/components/post-editor";
import { getPostByIdAdmin } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = useParams({ from: "/_authenticated/admin/$id" });
  const getPost = useServerFn(getPostByIdAdmin);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => getPost({ data: { id } }),
  });

  return (
    <div>
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold">Edit post</h1>
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !post ? (
        <p className="text-sm text-muted-foreground">Post not found.</p>
      ) : (
        <PostEditor post={post} />
      )}
    </div>
  );
}
