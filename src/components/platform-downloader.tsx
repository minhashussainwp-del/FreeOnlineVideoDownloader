import { useState } from "react";
import { Download, Loader2, LinkIcon, AlertCircle, Clapperboard, Check, ClipboardPaste } from "lucide-react";
import type { Platform } from "@/lib/platforms";
import { PlatformIcon } from "@/lib/platform-icons";
import { fetchDownload, type MediaInfo } from "@/lib/download";

type Status = "idle" | "loading" | "done" | "error";
type Format = { label: string; url: string; note?: string };

function rankQuality(label: string) {
  const m = label.match(/(\d{3,4})\s*p/i);
  if (m) return parseInt(m[1], 10);
  const l = label.toLowerCase();
  if (l.includes("4k") || l.includes("2160")) return 2160;
  if (l.includes("2k") || l.includes("1440")) return 1440;
  if (l.includes("hd")) return 720;
  if (l.includes("sd")) return 480;
  return 0;
}

function buildFormats(mi: MediaInfo) {
  const video: Format[] = [];
  const audio: Format[] = [];
  const seen = new Set<string>();

  const pushVideo = (label: string, url?: string | null, note?: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    video.push({ label, url, note });
  };
  const pushAudio = (label: string, url?: string | null, note?: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    audio.push({ label, url, note });
  };

  if (Array.isArray(mi.qualities)) {
    for (const q of mi.qualities) {
      if (!q) continue;
      if (typeof q === "string") {
        pushVideo(q, q);
      } else if (q.url) {
        const label = q.quality || q.label || "Video";
        if (/audio|mp3|m4a/i.test(label)) pushAudio(label, q.url);
        else pushVideo(label, q.url);
      }
    }
  }

  // When the API doesn't expose separate resolutions, offer the standard
  // 360p–1080p choices — all resolve to the best available file.
  if (video.length === 0 && mi.videoUrl) {
    const resolutions: Array<{ label: string; note?: string }> = [
      { label: "1080p", note: "Full HD" },
      { label: "720p", note: "HD" },
      { label: "480p" },
      { label: "360p" },
    ];
    for (const r of resolutions) {
      video.push({ label: r.label, url: mi.videoUrl, note: r.note });
    }
  } else {
    // API provided real qualities — add the main link as a fallback option.
    pushVideo("Standard", mi.videoUrl);
  }

  pushAudio("MP3", mi.audioUrl || mi.musicUrl || mi.downloadMp3, "Audio only");

  video.sort((a, b) => rankQuality(b.label) - rankQuality(a.label));
  return { video, audio };
}

export function PlatformDownloader({
  platform,
  downloadAdUrl,
}: {
  platform: Platform;
  downloadAdUrl?: string | null;
}) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [media, setMedia] = useState<MediaInfo | null>(null);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = url.trim();
    if (!value) return;

    // Open the ad in a new tab, then continue the download in this tab.
    if (downloadAdUrl && downloadAdUrl.trim()) {
      window.open(downloadAdUrl.trim(), "_blank", "noopener,noreferrer");
    }

    setStatus("loading");
    setError("");
    setMedia(null);

    try {
      const data = await fetchDownload(value);
      if (data.success && data.mediaInfo) {
        setMedia(data.mediaInfo);
        setStatus("done");
      } else {
        setError(data.message || "We couldn't find a downloadable video at that link.");
        setStatus("error");
      }
    } catch {
      setError("Something went wrong. Please check the link and try again.");
      setStatus("error");
    }
  }

  const formats = media ? buildFormats(media) : { video: [], audio: [] };
  const rows: Array<{ format: string; quality: string; note?: string; url: string }> = [
    ...formats.video.map((f) => ({ format: "MP4", quality: f.label, note: f.note, url: f.url })),
    ...formats.audio.map((f) => ({ format: "MP3", quality: f.label, note: f.note ?? "Audio", url: f.url })),
  ];
  const cover = media?.thumbnail || media?.coverImage || null;
  const creator = media?.author || media?.authorName || media?.creator || null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft-lg sm:flex-row sm:items-center sm:pl-4">
          <div className="flex flex-1 items-center gap-3">
            <LinkIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={platform.placeholder}
              className="w-full bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
              aria-label={`${platform.name} link`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              <ClipboardPaste className="h-4 w-4" /> Paste
            </button>
            <button
              type="submit"
              disabled={status === "loading" || !url.trim()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-display text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" strokeWidth={2.5} />
              )}
              {status === "loading" ? "Fetching…" : "Download"}
            </button>
          </div>
        </div>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Supports public videos only. Private or restricted videos may not work.
      </p>

      {status === "error" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p>{error}</p>
        </div>
      )}

      {/* "Your Video is Ready!" — only shown after a successful download */}
      {status === "done" && media && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft-lg">
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-5 py-3">
            <Check className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold">Your Video is Ready!</h3>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:flex-row">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-secondary sm:w-56">
              {cover ? (
                <img
                  src={cover}
                  alt={media.title || `${platform.name} video thumbnail`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Clapperboard className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
                <PlatformIcon slug={platform.slug} className="h-3.5 w-3.5" /> {media.platform || platform.name}
              </span>
              <h4 className="mt-2 line-clamp-2 text-lg font-bold leading-snug">
                {media.title || "Your download is ready"}
              </h4>
              {creator && <p className="mt-1 text-sm text-muted-foreground">by {creator}</p>}
              <p className="mt-1 text-sm text-muted-foreground">Your video is ready to download.</p>
            </div>
          </div>

          {/* Format table */}
          {rows.length > 0 && (
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Format</th>
                    <th className="px-5 py-3">Quality</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={`${r.format}-${r.quality}-${i}`}>
                      <td className="px-5 py-3 font-bold">{r.format}</td>
                      <td className="px-5 py-3">{r.quality}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.note || "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2.5} /> Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-muted-foreground">
                Available formats depend on the original video.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

