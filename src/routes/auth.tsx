import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Online Video Downloader" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error((err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
"w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute left-1/2 top-0 h-64 w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Download className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span>
            Online Video <span className="text-primary">Downloader</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-elegant backdrop-blur-xl sm:p-8">
          <h1 className="font-display text-2xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your blog.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                className={inputCls}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                className={inputCls}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
