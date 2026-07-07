import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PostEditor } from "@/components/post-editor";

export const Route = createFileRoute("/_authenticated/admin/new")({
  component: NewPost,
});

function NewPost() {
  return (
    <div>
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold">New post</h1>
      <PostEditor />
    </div>
  );
}
