import { Link } from "@tanstack/react-router";
import { Download, Youtube, Instagram, Facebook, Twitter, Send, Mail, Heart } from "lucide-react";
import { useEnabledPlatforms, useBranding } from "@/lib/use-site-data";

const resources = [
  { to: "/how-to-download", label: "How It Works" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

const legal = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/dmca", label: "Copyright / DMCA" },
  { to: "/about", label: "About" },
] as const;

const socials = [
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://twitter.com", label: "X (Twitter)", icon: Twitter },
  { href: "https://t.me", label: "Telegram", icon: Send },
  { href: "mailto:hello@example.com", label: "Email", icon: Mail },
] as const;

export function SiteFooter() {
  const platforms = useEnabledPlatforms();
  const branding = useBranding();
  const nameParts = branding.siteName.trim().split(/\s+/);
  const lastWord = nameParts.length > 1 ? nameParts.pop() : "";
  return (
    <footer className="dark relative mt-24 overflow-hidden border-t border-white/10 bg-[linear-gradient(160deg,hsl(222_47%_11%),hsl(250_45%_16%)_60%,hsl(265_50%_20%))] text-foreground">
      {/* glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 font-display text-lg font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
                <Download className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span>
                {nameParts.join(" ")} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{lastWord}</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {branding.footerTagline}
            </p>

            {/* social icons */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/15 hover:text-foreground"
                >
                  <s.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              Tools
            </h3>
            <div className="grid gap-2.5">
              {platforms.slice(0, 5).map((p) => (
                <Link
                  key={p.slug}
                  to="/$platform"
                  params={{ platform: p.slug }}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {p.name} Video Downloader
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              Resources
            </h3>
            <div className="grid gap-2.5">
              {resources.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              Legal
            </h3>
            <div className="grid gap-2.5">
              {legal.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} {branding.siteName}. Made with
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for creators.
          </p>
          <p className="sm:max-w-lg sm:text-right">
            We are not affiliated with YouTube, TikTok, Instagram, Facebook, X, Reddit, Snapchat,
            SoundCloud, CapCut, SnackVideo, or Douyin.
          </p>
        </div>
      </div>
    </footer>
  );
}
