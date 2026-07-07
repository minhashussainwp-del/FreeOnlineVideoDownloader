import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LayoutDashboard, PlusCircle, ExternalLink, LogOut, ShieldAlert, Wrench, FileSliders, Megaphone, Sparkles, Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminAccess } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ensureAccess = useServerFn(ensureAdminAccess);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => ensureAccess(),
    retry: false,
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="font-display text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have admin permissions for the blog.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-1">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-display text-sm font-bold"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" /> Blog admin
            </Link>
            <Link
              to="/admin/tools"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Wrench className="h-4 w-4" /> Tools
            </Link>
            <Link
              to="/admin/pages"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <FileSliders className="h-4 w-4" /> Pages
            </Link>
            <Link
              to="/admin/ads"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Megaphone className="h-4 w-4" /> Ads
            </Link>
            <Link
              to="/admin/ai"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="h-4 w-4" /> AI Writer
            </Link>
            <Link
              to="/admin/seo"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Gauge className="h-4 w-4" /> SEO
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <PlusCircle className="h-4 w-4" /> New post
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" /> View blog
            </Link>
            <button
              onClick={signOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
