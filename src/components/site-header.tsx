import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Download,
  Menu,
  X,
  Mail,
  Home,
  Newspaper,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { useBranding, useEnabledPlatforms } from "@/lib/use-site-data";

/** Render a brand name with the last word highlighted in the primary color. */
function renderBrand(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <span className="text-gradient-brand">{last}</span>
    </>
  );
}

type NavItem = { label: string; to: string; hash?: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
];

const BLOG: NavItem = { label: "Blog", to: "/blog", icon: Newspaper };


export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const branding = useBranding();
  const topPlatforms = useEnabledPlatforms().slice(0, 4);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft">
            <Download className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="leading-none tracking-tight">{renderBrand(branding.siteName)}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((l) => {
            const active =
              !l.hash && (pathname === l.to || (l.to !== "/" && pathname.startsWith(`${l.to}/`)));
            return (
              <Link
                key={l.label}
                to={l.to}
                hash={l.hash}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {/* Top 4 platforms */}
          {topPlatforms.map((p) => {
            const active = pathname === `/${p.slug}`;
            return (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                title={p.name}
                style={{ color: active ? undefined : p.color }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <PlatformIcon slug={p.slug} className="h-4 w-4" />
                <span className="text-foreground">{p.name}</span>
              </Link>
            );
          })}

          {/* Blog (second last) */}
          <Link
            to={BLOG.to}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
              pathname.startsWith(BLOG.to)
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <BLOG.icon className="h-4 w-4" />
            {BLOG.label}
          </Link>

          <Link
            to="/contact"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Mail className="h-4 w-4" />
            Contact Us
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all active:scale-95 lg:hidden ${
            menuOpen ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
          }`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu — single-column dropdown, one item per line */}
      {menuOpen && (
        <div className="animate-in fade-in slide-in-from-top-3 border-t border-border glass duration-200 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col divide-y divide-border px-4 py-3">
            {NAV.map((l) => {
              const Icon = l.icon;
              const active =
                pathname === l.to || (l.to !== "/" && pathname.startsWith(`${l.to}/`));
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  hash={l.hash}
                  className={`flex items-center gap-3 py-3 text-sm font-semibold transition-colors active:scale-[0.99] ${
                    active ? "text-primary" : "text-foreground"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{l.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}

            {/* Top 4 platforms — one per line */}
            {topPlatforms.map((p) => (
              <Link
                key={p.slug}
                to="/$platform"
                params={{ platform: p.slug }}
                className="flex items-center gap-3 py-3 text-sm font-semibold text-foreground transition-colors active:scale-[0.99]"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    color: p.color,
                    background: "color-mix(in oklab, currentColor 14%, white)",
                  }}
                >
                  <PlatformIcon slug={p.slug} className="h-4 w-4" />
                </span>
                <span className="flex-1">{p.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}

            {/* Blog (second last) */}
            <Link
              to={BLOG.to}
              className={`flex items-center gap-3 py-3 text-sm font-semibold transition-colors active:scale-[0.99] ${
                pathname.startsWith(BLOG.to) ? "text-primary" : "text-foreground"
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <BLOG.icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{BLOG.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <div className="pt-3">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all active:scale-[0.98]"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
