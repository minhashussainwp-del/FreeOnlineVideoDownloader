import { Link } from "@tanstack/react-router";
import { PlatformIcon } from "@/lib/platform-icons";
import { useEnabledPlatforms, useBranding } from "@/lib/use-site-data";

const company = [
  { to: "/about", label: "About" },
  { to: "/how-to-download", label: "How it works" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

const legal = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/dmca", label: "Copyright / DMCA" },
] as const;

export function SiteFooter() {
  const platforms = useEnabledPlatforms();
  const branding = useBranding();
  const nameParts = branding.siteName.trim().split(/\s+/);
  const lastWord = nameParts.length > 1 ? nameParts.pop() : "";
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="font-display text-lg font-bold">
              {nameParts.join(" ")} <span className="text-primary">{lastWord}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{branding.footerTagline}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Platforms</h3>
            <div className="grid gap-2">
              {platforms.slice(0, 6).map((p) => (
                <Link
                  key={p.slug}
                  to="/$platform"
                  params={{ platform: p.slug }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <PlatformIcon slug={p.slug} className="h-3.5 w-3.5" /> {p.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Company</h3>
            <div className="grid gap-2">
              {company.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Legal</h3>
            <div className="grid gap-2">
              {legal.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {branding.siteName}. Please only download content you own or
            have permission to use. Respect each platform&apos;s terms of service.
          </p>
        </div>
      </div>
    </footer>
  );
}

