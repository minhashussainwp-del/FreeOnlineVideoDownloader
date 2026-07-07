import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Download, Menu, X, Mail, BookOpen } from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { useEnabledPlatforms, useBranding } from "@/lib/use-site-data";

/** Platforms shown directly in the header; the rest go under "Others". */
const PRIMARY_SLUGS = ["youtube", "facebook", "instagram", "tiktok"] as const;

/** Render a brand name with the last word highlighted in the primary color. */
function renderBrand(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <span className="text-primary">{last}</span>
    </>
  );
}

const pageLinks = [
  { to: "/blog", label: "Blogs", icon: BookOpen },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const platforms = useEnabledPlatforms();
  const branding = useBranding();

  // Only the primary platforms are shown in the header (in a fixed order).
  const primary = PRIMARY_SLUGS.map((slug) => platforms.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  // Close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);


  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Download className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="leading-none">{renderBrand(branding.siteName)}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {primary.map((p) => {
            const active = pathname === `/${p.slug}`;
            return (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                style={{ ["--brand" as string]: p.color }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PlatformIcon slug={p.slug} className="h-4 w-4 text-brand" />
                {p.name}
              </Link>
            );
          })}


          {pageLinks.map((l) => {
            const active = pathname === l.to || pathname.startsWith(`${l.to}/`);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}

          <Link
            to="/contact"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          >
            <Mail className="h-4 w-4" />
            Contact us
          </Link>
        </nav>


        <div className="flex items-center gap-2">


          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-95 lg:hidden ${
              menuOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-200 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-h-[80vh] max-w-6xl space-y-6 overflow-y-auto px-4 py-6">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Downloaders
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {primary.map((p) => (
                  <Link
                    key={p.slug}
                    to="/$platform"
                    params={{ platform: p.slug }}
                    style={{ ["--brand" as string]: p.color }}
                    className="group flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 transition-all active:scale-[0.97] hover:border-brand/40 hover:bg-brand/5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/20 transition-transform group-hover:scale-110">
                      <PlatformIcon slug={p.slug} className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Pages
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {pageLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="group flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 transition-all active:scale-[0.97] hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
                      <l.icon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-semibold">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-all active:scale-[0.97]"
            >
              <Mail className="h-4 w-4" />
              Contact us
            </Link>

          </div>

        </div>
      )}
    </header>
  );
}
