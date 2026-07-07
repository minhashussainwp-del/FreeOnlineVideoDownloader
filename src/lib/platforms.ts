export type Platform = {
  slug: string;
  name: string;
  emoji: string;
  /** oklch brand color applied as --brand on the page */
  color: string;
  tagline: string;
  description: string;
  placeholder: string;
  /** hostnames that indicate a valid URL for this platform */
  hosts: string[];
  audio?: boolean;
  /** Unique SEO <title> for the platform page */
  seoTitle: string;
  /** Unique meta description for the platform page */
  seoDescription: string;
};

export const platforms: Platform[] = [
  {
    slug: "youtube",
    name: "YouTube",
    emoji: "🎥",
    color: "oklch(0.63 0.24 25)",
    tagline: "Videos, Shorts & Music",
    description: "Download YouTube videos and Shorts in high quality, or grab audio-only MP3.",
    placeholder: "https://www.youtube.com/watch?v=...",
    hosts: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
    audio: true,
    seoTitle: "YouTube Video Downloader – Save Videos, Shorts & MP3 Free",
    seoDescription:
      "Download YouTube videos, Shorts and audio in HD or MP3 for free. Paste a link and save clips for offline viewing — no app, no sign-up, no limits.",
  },
  {
    slug: "tiktok",
    name: "TikTok",
    emoji: "🎵",
    color: "oklch(0.78 0.16 190)",
    tagline: "No-watermark videos",
    description: "Save TikTok videos without the watermark, plus the original sound.",
    placeholder: "https://www.tiktok.com/@user/video/...",
    hosts: ["tiktok.com", "vm.tiktok.com"],
    audio: true,
    seoTitle: "TikTok Downloader – Save Videos Without Watermark (Free)",
    seoDescription:
      "Download TikTok videos without the watermark plus the original sound. Free, fast and simple — paste the link and save clips to any device.",
  },
  {
    slug: "instagram",
    name: "Instagram",
    emoji: "📸",
    color: "oklch(0.7 0.2 350)",
    tagline: "Reels, Posts & Stories",
    description: "Download Instagram Reels, video posts and stories straight to your device.",
    placeholder: "https://www.instagram.com/reel/...",
    hosts: ["instagram.com", "instagr.am"],
    seoTitle: "Instagram Video Downloader – Reels, Posts & Stories Free",
    seoDescription:
      "Save Instagram Reels, video posts and stories straight to your phone or PC. Free HD downloads with no app or login — just paste the link.",
  },
  {
    slug: "facebook",
    name: "Facebook",
    emoji: "👥",
    color: "oklch(0.6 0.18 255)",
    tagline: "Videos & Reels",
    description: "Grab Facebook videos, Reels and watch clips in the best available quality.",
    placeholder: "https://www.facebook.com/watch?v=...",
    hosts: ["facebook.com", "fb.watch", "fb.com"],
    seoTitle: "Facebook Video Downloader – Save Videos & Reels in HD",
    seoDescription:
      "Download Facebook videos, Reels and watch clips in the best quality available. Free and fast — paste any public Facebook link and save it instantly.",
  },
  {
    slug: "twitter",
    name: "Twitter / X",
    emoji: "🐦",
    color: "oklch(0.72 0.14 235)",
    tagline: "Video tweets",
    description: "Download videos and GIFs from Twitter / X posts in one click.",
    placeholder: "https://x.com/user/status/...",
    hosts: ["twitter.com", "x.com", "t.co"],
    seoTitle: "Twitter / X Video Downloader – Save Video Tweets & GIFs",
    seoDescription:
      "Download videos and GIFs from Twitter / X posts in one click. Free, quick and watermark-free — paste the tweet link and save the clip offline.",
  },
  {
    slug: "reddit",
    name: "Reddit",
    emoji: "📱",
    color: "oklch(0.68 0.2 40)",
    tagline: "Video posts",
    description: "Save Reddit videos with sound from any subreddit post.",
    placeholder: "https://www.reddit.com/r/.../comments/...",
    hosts: ["reddit.com", "redd.it"],
    seoTitle: "Reddit Video Downloader – Save Reddit Videos With Sound",
    seoDescription:
      "Download Reddit videos with sound from any subreddit post. Free and easy — paste the Reddit link and save the clip to your device in seconds.",
  },
  {
    slug: "snapchat",
    name: "Snapchat",
    emoji: "👻",
    color: "oklch(0.88 0.18 100)",
    tagline: "Spotlight & Stories",
    description: "Download Snapchat Spotlight clips and public stories effortlessly.",
    placeholder: "https://www.snapchat.com/spotlight/...",
    hosts: ["snapchat.com"],
    seoTitle: "Snapchat Video Downloader – Save Spotlight & Stories Free",
    seoDescription:
      "Download Snapchat Spotlight clips and public stories with ease. Free, fast and no app needed — paste the link and save Snapchat videos offline.",
  },
  {
    slug: "soundcloud",
    name: "SoundCloud",
    emoji: "🎧",
    color: "oklch(0.7 0.19 55)",
    tagline: "Tracks & audio",
    description: "Download SoundCloud tracks as audio files for offline listening.",
    placeholder: "https://soundcloud.com/artist/track",
    hosts: ["soundcloud.com", "on.soundcloud.com"],
    audio: true,
    seoTitle: "SoundCloud Downloader – Save Tracks as MP3 Audio Free",
    seoDescription:
      "Download SoundCloud tracks as high-quality audio for offline listening. Free and simple — paste the track link and save your music in seconds.",
  },
  {
    slug: "capcut",
    name: "CapCut",
    emoji: "✂️",
    color: "oklch(0.72 0.14 210)",
    tagline: "Templates & videos",
    description: "Download CapCut template videos and shared clips instantly.",
    placeholder: "https://www.capcut.com/t/...",
    hosts: ["capcut.com"],
    seoTitle: "CapCut Video Downloader – Save Templates & Clips Free",
    seoDescription:
      "Download CapCut template videos and shared clips instantly. Free, fast and no sign-up — paste the CapCut link and save the video to your device.",
  },
  {
    slug: "snackvideo",
    name: "SnackVideo",
    emoji: "🎬",
    color: "oklch(0.7 0.2 30)",
    tagline: "Short videos",
    description: "Save SnackVideo short clips without any watermark.",
    placeholder: "https://www.snackvideo.com/@user/video/...",
    hosts: ["snackvideo.com", "sck.io"],
    audio: true,
    seoTitle: "SnackVideo Downloader – Save Clips Without Watermark Free",
    seoDescription:
      "Save SnackVideo short clips without any watermark for free. Fast and easy — paste the SnackVideo link and download videos to your phone or PC.",
  },
  {
    slug: "douyin",
    name: "Douyin",
    emoji: "🎭",
    color: "oklch(0.68 0.19 355)",
    tagline: "Chinese TikTok",
    description: "Download Douyin videos in high quality without watermarks.",
    placeholder: "https://www.douyin.com/video/...",
    hosts: ["douyin.com", "iesdouyin.com"],
    audio: true,
    seoTitle: "Douyin Video Downloader – HD, No Watermark & Free",
    seoDescription:
      "Download Douyin videos in high quality without watermarks. Free, quick and no app required — paste the Douyin link and save clips offline.",
  },
];

export const platformMap: Record<string, Platform> = Object.fromEntries(
  platforms.map((p) => [p.slug, p]),
);

export function getPlatform(slug: string): Platform | undefined {
  return platformMap[slug];
}
