export type Faq = { q: string; a: string };
export type Feature = { title: string; text: string };

export type PlatformArticle = {
  /** One-sentence definition used for AEO/GEO answer snippets and JSON-LD. */
  answer: string;
  intro: string[];
  features: Feature[];
  formats: string;
  useCases: string[];
  faqs: Faq[];
  /** Semantic keyword cluster for the meta keywords tag. */
  keywords: string[];
};

const articles: Record<string, PlatformArticle> = {
  youtube: {
    answer:
      "Free Online Video Downloader is a free online YouTube video downloader that saves YouTube videos, Shorts and music as MP4 or MP3 files in resolutions from 360p to 1080p — no app, login or watermark.",
    intro: [
      "Free Online Video Downloader's YouTube downloader lets you save any public YouTube video, Short, live replay or music clip straight to your phone, tablet or computer. Paste a link, pick a resolution from 360p up to 1080p Full HD, and download a standard MP4 in seconds — completely free and with no sign-up.",
      "Because everything runs in your browser, there is nothing to install and no account to create. Free Online Video Downloader reads the highest-quality stream YouTube makes available and hands you a clean file that plays in any media player, whether you are archiving a tutorial for offline study, keeping a music video, or turning a talk into an MP3 for the commute.",
    ],
    features: [
      { title: "Choose your resolution", text: "Download in 360p, 480p, 720p HD or 1080p Full HD, or switch to audio-only MP3 — you decide the balance between quality and file size." },
      { title: "Videos, Shorts & music", text: "One box handles long-form videos, YouTube Shorts, live replays and official music videos." },
      { title: "YouTube to MP3", text: "Extract crisp audio from any video to build playlists, study tracks or podcast clips." },
      { title: "No app, no login", text: "Works on Android, iPhone, Windows and Mac directly from the browser — nothing installed, no watermark." },
    ],
    formats:
      "YouTube downloads are delivered as MP4 video (H.264) for maximum device compatibility, or as MP3 for audio-only saves. Available resolutions depend on what YouTube publishes for each video, so newer uploads typically offer up to 1080p Full HD while older clips may top out lower.",
    useCases: [
      "Save tutorials and lectures for offline learning",
      "Keep music videos and convert them to MP3 playlists",
      "Archive Shorts before creators remove them",
      "Grab reference clips for editing and study",
    ],
    faqs: [
      { q: "Is Free Online Video Downloader's YouTube downloader free?", a: "Yes. Downloading YouTube videos and MP3s with Free Online Video Downloader is completely free with no limits, subscriptions or hidden fees." },
      { q: "Can I download YouTube videos in 1080p?", a: "Yes. When YouTube provides a 1080p stream, select the Full HD option before downloading. If a video was uploaded at a lower resolution, only the qualities YouTube offers will appear." },
      { q: "How do I convert a YouTube video to MP3?", a: "Paste the video link, switch to the Audio (MP3) tab in the result, and press download. Free Online Video Downloader extracts the audio track and saves it as an MP3 file." },
      { q: "Do I need an app or browser extension?", a: "No. Free Online Video Downloader runs entirely in your web browser on any device, so there is nothing to install." },
      { q: "Can I download YouTube Shorts?", a: "Yes. Paste the Shorts link exactly like a normal video and download it as MP4 or MP3." },
      { q: "Is it legal to download YouTube videos?", a: "Only download videos you own or have permission to use. Saving copyrighted content for anything beyond personal use may breach YouTube's terms and local copyright law." },
    ],
    keywords: ["youtube video downloader", "download youtube videos", "youtube to mp3", "youtube shorts downloader", "youtube 1080p download", "save youtube video"],
  },

  tiktok: {
    answer:
      "Free Online Video Downloader is a free TikTok downloader that saves TikTok videos without the watermark, plus the original sound as MP3 — straight from your browser with no app or login.",
    intro: [
      "Free Online Video Downloader's TikTok downloader saves any public TikTok video without the watermark, keeping the clip clean for re-sharing, editing or offline viewing. Paste the video link, and within seconds you get a crisp MP4 free of the bouncing TikTok logo.",
      "You can also pull the original sound as an MP3, which is perfect for creators who want to reuse a trending audio or keep a track for later. Everything works on Android, iPhone and desktop with no app to install and no account required.",
    ],
    features: [
      { title: "No watermark", text: "Download TikTok videos in full quality without the TikTok logo or username stamp." },
      { title: "Original sound as MP3", text: "Save the exact audio behind any TikTok to reuse trending sounds or build a library." },
      { title: "HD quality", text: "Free Online Video Downloader grabs the highest-resolution version TikTok serves for a sharp result." },
      { title: "Any device, no app", text: "Works from the browser on phones and computers — nothing to install." },
    ],
    formats:
      "TikTok saves come as watermark-free MP4 video, with the original audio also available as MP3. Free Online Video Downloader always pulls the best resolution TikTok provides for the clip you paste.",
    useCases: [
      "Repost your own TikToks to other platforms without the logo",
      "Save trending sounds as MP3 for future videos",
      "Keep favourite clips for offline viewing",
      "Collect reference footage for editing",
    ],
    faqs: [
      { q: "Does Free Online Video Downloader remove the TikTok watermark?", a: "Yes. Free Online Video Downloader downloads TikTok videos without the watermark so the clip is clean and ready to re-share or edit." },
      { q: "Can I download the sound from a TikTok?", a: "Yes. Switch to the Audio (MP3) tab in the result to save the original TikTok sound as an MP3." },
      { q: "Is the TikTok downloader free?", a: "Completely free, with no watermark, no sign-up and no daily limits." },
      { q: "Can I download private TikTok videos?", a: "No. Free Online Video Downloader can only download public TikTok videos. Private or restricted posts are not accessible." },
      { q: "Do I need the TikTok app installed?", a: "No. Copy the video's Share link and paste it into Free Online Video Downloader — everything runs in the browser." },
      { q: "Will the video keep its HD quality?", a: "Yes. Free Online Video Downloader saves the highest quality TikTok makes available for that video." },
    ],
    keywords: ["tiktok downloader", "download tiktok without watermark", "tiktok video download", "tiktok mp3", "save tiktok video", "tiktok sound download"],
  },

  instagram: {
    answer:
      "Free Online Video Downloader is a free Instagram downloader for saving Reels, video posts and Stories as MP4 files directly from your browser — no app, login or watermark.",
    intro: [
      "Free Online Video Downloader's Instagram downloader saves Reels, video posts and public Stories to your device in one click. Paste the link to any public Instagram video and download a clean MP4 that plays anywhere.",
      "There is no app to install and no Instagram login required, so your account stays private. Free Online Video Downloader works the same on iPhone, Android and desktop, making it easy to keep the Reels and clips you love for offline viewing or re-editing.",
    ],
    features: [
      { title: "Reels, posts & Stories", text: "Download Instagram Reels, feed video posts and public Stories from a single box." },
      { title: "Full quality MP4", text: "Save videos in the original resolution Instagram serves, with no re-compression." },
      { title: "No login needed", text: "Free Online Video Downloader never asks for your Instagram credentials — public links are all it needs." },
      { title: "Phone & desktop", text: "Works on iPhone, Android, Windows and Mac right from the browser." },
    ],
    formats:
      "Instagram downloads are saved as MP4 video in the best quality Instagram provides for the post. Only public content can be downloaded — private accounts and Close Friends Stories are not accessible.",
    useCases: [
      "Save your own Reels to repost or archive",
      "Keep inspiring content for mood boards and editing",
      "Download public Stories before they expire",
      "Collect video references for creators and marketers",
    ],
    faqs: [
      { q: "Can I download Instagram Reels for free?", a: "Yes. Free Online Video Downloader downloads Instagram Reels, video posts and public Stories for free with no watermark or sign-up." },
      { q: "Do I need to log in to my Instagram account?", a: "No. Free Online Video Downloader only needs the public link to a Reel, post or Story — it never asks for your Instagram login." },
      { q: "Can I download private Instagram videos?", a: "No. Only public posts and Stories can be downloaded. Private accounts are not accessible." },
      { q: "How do I copy an Instagram Reel link?", a: "Tap the three dots on the Reel or post and choose Copy Link, then paste it into Free Online Video Downloader." },
      { q: "In what format are Instagram videos saved?", a: "Videos download as MP4 files that play on any phone or computer." },
      { q: "Does it work on iPhone?", a: "Yes. Free Online Video Downloader runs in Safari and other browsers on iPhone, Android and desktop." },
    ],
    keywords: ["instagram video downloader", "download instagram reels", "instagram story download", "save instagram video", "instagram reels downloader", "ig video download"],
  },

  facebook: {
    answer:
      "Free Online Video Downloader is a free Facebook video downloader that saves Facebook videos, Reels and Watch clips as MP4 files in the best available quality — no app or login required.",
    intro: [
      "Free Online Video Downloader's Facebook downloader saves videos, Reels and Watch clips from public Facebook posts to your device. Paste the link and download an MP4 in HD or standard definition, whichever the post provides.",
      "Everything runs in your browser with no software to install and no Facebook login, so you can quickly keep the clips you want without handing over your account details. It works across iPhone, Android and desktop.",
    ],
    features: [
      { title: "Videos, Reels & Watch", text: "Download regular Facebook videos, Reels and Watch clips from a single link." },
      { title: "HD or SD", text: "Free Online Video Downloader grabs the highest quality the post offers, with a smaller SD option when you need it." },
      { title: "No login required", text: "Only public video links are needed — your Facebook account stays private." },
      { title: "Cross-device", text: "Save videos on phones and computers directly from the browser." },
    ],
    formats:
      "Facebook videos are saved as MP4 in the best resolution the post makes available. Some public posts offer both HD and SD versions; private or friends-only videos cannot be downloaded.",
    useCases: [
      "Archive your own page's videos and Reels",
      "Save public clips for offline viewing",
      "Keep reference footage for social media work",
      "Download event or news clips you want to revisit",
    ],
    faqs: [
      { q: "How do I download a Facebook video?", a: "Copy the video's link from the post's menu or share button, paste it into Free Online Video Downloader, then choose your quality and download the MP4." },
      { q: "Can I download Facebook Reels?", a: "Yes. Free Online Video Downloader supports Facebook Reels, standard videos and Watch clips from public posts." },
      { q: "Is a Facebook login required?", a: "No. Free Online Video Downloader only needs the public video link and never asks for your Facebook credentials." },
      { q: "Can I download private Facebook videos?", a: "No. Only public videos can be downloaded. Private or friends-only posts are not accessible." },
      { q: "What quality can I download?", a: "Free Online Video Downloader offers the best quality the post provides, typically HD, with a standard-definition option for smaller files." },
      { q: "Is the Facebook downloader free?", a: "Yes, it is completely free with no watermark and no sign-up." },
    ],
    keywords: ["facebook video downloader", "download facebook videos", "facebook reels download", "fb video download", "save facebook video", "facebook watch downloader"],
  },

  twitter: {
    answer:
      "Free Online Video Downloader is a free Twitter / X video downloader that saves videos and GIFs from tweets as MP4 files in one click — no app or login.",
    intro: [
      "Free Online Video Downloader's Twitter / X downloader saves videos and GIFs from any public tweet as an MP4. Paste the tweet link and download the clip in the best quality X provides, ready for offline viewing or re-sharing.",
      "No app, extension or X login is needed. Free Online Video Downloader works the same on iPhone, Android and desktop, so you can quickly keep viral clips, news footage or your own posts without screen recording.",
    ],
    features: [
      { title: "Video & GIF support", text: "Download both native tweet videos and animated GIFs as clean MP4 files." },
      { title: "Best available quality", text: "Free Online Video Downloader pulls the highest resolution X serves for the tweet you paste." },
      { title: "No login or app", text: "Only the public tweet link is required — your X account stays private." },
      { title: "Works everywhere", text: "Save clips from phones and computers straight from the browser." },
    ],
    formats:
      "Twitter / X videos and GIFs are saved as MP4 for universal playback. Free Online Video Downloader selects the best resolution available for each tweet; only public tweets can be downloaded.",
    useCases: [
      "Save viral clips before tweets are deleted",
      "Download your own video tweets to reuse",
      "Keep news and sports highlights offline",
      "Collect GIFs and clips for editing",
    ],
    faqs: [
      { q: "How do I download a video from X (Twitter)?", a: "Tap Share on the tweet, copy the link, paste it into Free Online Video Downloader, and download the MP4." },
      { q: "Can I download Twitter GIFs?", a: "Yes. Free Online Video Downloader saves animated tweet GIFs as MP4 video files." },
      { q: "Does it work with the new x.com links?", a: "Yes. Both twitter.com and x.com tweet links are supported." },
      { q: "Do I need to log in to X?", a: "No. Free Online Video Downloader only needs the public tweet link and never asks for your account." },
      { q: "Can I download videos from private accounts?", a: "No. Only videos from public tweets can be downloaded." },
      { q: "Is the Twitter / X downloader free?", a: "Yes, it is free with no watermark and no sign-up." },
    ],
    keywords: ["twitter video downloader", "x video downloader", "download twitter video", "twitter gif download", "save x video", "download video from tweet"],
  },

  reddit: {
    answer:
      "Free Online Video Downloader is a free Reddit video downloader that saves Reddit videos with their sound as MP4 files from any public post — no app or login.",
    intro: [
      "Free Online Video Downloader's Reddit downloader saves videos from any public Reddit post — with the audio correctly merged in. Reddit often splits video and sound into separate streams, so ordinary saves come out silent; Free Online Video Downloader combines them into one MP4.",
      "Paste the post link from any subreddit and download the clip in the best quality available. There is no app to install and no Reddit login required, and it works across iPhone, Android and desktop.",
    ],
    features: [
      { title: "Video with sound", text: "Free Online Video Downloader merges Reddit's separate video and audio streams so your download plays with sound." },
      { title: "Any subreddit", text: "Works with video posts from any public subreddit or shared redd.it link." },
      { title: "Best quality", text: "Downloads the highest resolution Reddit hosts for the post." },
      { title: "No account needed", text: "Only the public post link is required — no login, no app." },
    ],
    formats:
      "Reddit videos are saved as MP4 with the audio track merged in. Free Online Video Downloader pulls the best resolution Reddit provides. Only public posts can be downloaded.",
    useCases: [
      "Save clips with sound that Reddit normally splits",
      "Keep favourite subreddit videos offline",
      "Download reaction and highlight clips",
      "Collect footage for editing or sharing",
    ],
    faqs: [
      { q: "Why do Reddit videos download without sound elsewhere?", a: "Reddit stores video and audio as separate streams. Free Online Video Downloader merges them so your download includes the sound." },
      { q: "How do I download a Reddit video?", a: "Copy the post link (or the redd.it share link), paste it into Free Online Video Downloader, and download the MP4." },
      { q: "Does it work with any subreddit?", a: "Yes. Any public video post from any subreddit can be downloaded." },
      { q: "Do I need a Reddit account?", a: "No. Free Online Video Downloader only needs the public post link and never asks for your login." },
      { q: "What format are Reddit videos saved in?", a: "Videos are saved as MP4 with merged audio, playable on any device." },
      { q: "Is the Reddit downloader free?", a: "Yes, it is completely free with no sign-up." },
    ],
    keywords: ["reddit video downloader", "download reddit video with sound", "reddit video download", "save reddit video", "redd.it downloader", "reddit mp4"],
  },

  snapchat: {
    answer:
      "Free Online Video Downloader is a free Snapchat downloader that saves public Spotlight clips and Stories as MP4 files from your browser — no app or login.",
    intro: [
      "Free Online Video Downloader's Snapchat downloader saves public Spotlight clips and Stories to your device as MP4 files. Paste the Snapchat link and download the video in the best quality available for offline viewing.",
      "Everything works from the browser with no app to install and no Snapchat login, so your account and Snap history stay private. It works across iPhone, Android and desktop.",
    ],
    features: [
      { title: "Spotlight & Stories", text: "Download public Snapchat Spotlight videos and shared Stories in one click." },
      { title: "Clean MP4", text: "Save clips as standard MP4 files that play on any device." },
      { title: "No login needed", text: "Only the public Snapchat link is required — no credentials, no app." },
      { title: "Cross-device", text: "Works on phones and computers directly in the browser." },
    ],
    formats:
      "Snapchat downloads are saved as MP4 in the best quality available for the clip. Only public Spotlight and shared Story links can be downloaded; private Snaps are not accessible.",
    useCases: [
      "Save your own Spotlight clips to repost",
      "Keep viral Spotlight videos offline",
      "Download public Stories before they expire",
      "Collect clips for editing and sharing",
    ],
    faqs: [
      { q: "Can I download Snapchat Spotlight videos?", a: "Yes. Free Online Video Downloader saves public Snapchat Spotlight clips as MP4 files for free." },
      { q: "Do I need a Snapchat account to download?", a: "No. Free Online Video Downloader only needs the public Spotlight or Story link and never asks for your login." },
      { q: "Can I download private Snaps?", a: "No. Only public Spotlight and shared Story content can be downloaded." },
      { q: "How do I copy a Snapchat link?", a: "Use the share button on a Spotlight clip and choose Copy Link, then paste it into Free Online Video Downloader." },
      { q: "What format are Snapchat videos saved in?", a: "Clips are saved as MP4, which plays on any phone or computer." },
      { q: "Is the Snapchat downloader free?", a: "Yes, it is free with no sign-up." },
    ],
    keywords: ["snapchat downloader", "download snapchat spotlight", "snapchat video download", "save snapchat story", "snapchat spotlight downloader", "snap video download"],
  },

  soundcloud: {
    answer:
      "Free Online Video Downloader is a free SoundCloud downloader that saves SoundCloud tracks as MP3 audio files for offline listening — no app or login.",
    intro: [
      "Free Online Video Downloader's SoundCloud downloader saves tracks as MP3 files so you can listen offline on any device. Paste the track link and download high-quality audio in seconds — free and without an app.",
      "There is no software to install and no SoundCloud login required. Whether you are keeping a favourite mix, a podcast episode or a track you want on your phone, Free Online Video Downloader delivers a clean MP3 ready for any music player.",
    ],
    features: [
      { title: "High-quality MP3", text: "Download SoundCloud tracks as MP3 audio at the best quality the track provides." },
      { title: "Offline listening", text: "Keep mixes, songs and podcasts on your device with no streaming required." },
      { title: "No app or login", text: "Only the public track link is needed — nothing to install, no account." },
      { title: "Any device", text: "Works on iPhone, Android, Windows and Mac from the browser." },
    ],
    formats:
      "SoundCloud downloads are delivered as MP3 audio files. Free Online Video Downloader saves the best available quality for the track. Only publicly shared tracks can be downloaded.",
    useCases: [
      "Save mixes and DJ sets for offline playback",
      "Keep podcast episodes on your phone",
      "Build an offline library of favourite tracks",
      "Download your own uploads for backup",
    ],
    faqs: [
      { q: "How do I download a SoundCloud track?", a: "Copy the track link from SoundCloud's share menu, paste it into Free Online Video Downloader, and download the MP3." },
      { q: "In what format are SoundCloud downloads saved?", a: "Tracks are saved as MP3 audio files that play on any device or music app." },
      { q: "Do I need a SoundCloud account?", a: "No. Free Online Video Downloader only needs the public track link and never asks for your login." },
      { q: "Can I download private or paid tracks?", a: "No. Only publicly shared tracks can be downloaded." },
      { q: "Is the SoundCloud downloader free?", a: "Yes, it is completely free with no sign-up." },
      { q: "Can I download a full playlist?", a: "Free Online Video Downloader downloads one track per link. Paste each track individually to save a set." },
    ],
    keywords: ["soundcloud downloader", "soundcloud to mp3", "download soundcloud track", "soundcloud mp3 download", "save soundcloud audio", "soundcloud song download"],
  },

  capcut: {
    answer:
      "Free Online Video Downloader is a free CapCut downloader that saves CapCut template videos and shared clips as MP4 files with no watermark — no app or login.",
    intro: [
      "Free Online Video Downloader's CapCut downloader saves template videos and shared CapCut clips to your device as clean MP4 files. Paste the CapCut link and download the video in the best quality available.",
      "No app or CapCut login is required, and everything runs in the browser on iPhone, Android and desktop. It is the quick way to keep template previews and shared edits for reference or re-sharing.",
    ],
    features: [
      { title: "Templates & clips", text: "Download CapCut template videos and shared project clips from a single link." },
      { title: "No watermark", text: "Save clean MP4 files without the CapCut watermark where the source allows." },
      { title: "Best quality", text: "Free Online Video Downloader pulls the highest resolution CapCut serves for the clip." },
      { title: "No app needed", text: "Only the public CapCut link is required — nothing to install." },
    ],
    formats:
      "CapCut downloads are saved as MP4 in the best quality available. Only publicly shared CapCut links can be downloaded.",
    useCases: [
      "Save template previews for inspiration",
      "Keep shared edits for reference",
      "Download clips to re-edit in other apps",
      "Archive your own shared projects",
    ],
    faqs: [
      { q: "How do I download a CapCut video?", a: "Copy the CapCut share link, paste it into Free Online Video Downloader, and download the MP4." },
      { q: "Can I download CapCut templates?", a: "Yes. Free Online Video Downloader saves CapCut template videos and shared clips as MP4 files." },
      { q: "Do I need the CapCut app?", a: "No. Free Online Video Downloader only needs the public CapCut link and runs entirely in the browser." },
      { q: "Is there a watermark on downloads?", a: "Free Online Video Downloader saves clean files without an added watermark where the source clip allows." },
      { q: "What format are CapCut videos saved in?", a: "Clips are saved as MP4, playable on any device." },
      { q: "Is the CapCut downloader free?", a: "Yes, it is free with no sign-up." },
    ],
    keywords: ["capcut downloader", "download capcut video", "capcut template download", "save capcut video", "capcut no watermark", "capcut mp4 download"],
  },

  snackvideo: {
    answer:
      "Free Online Video Downloader is a free SnackVideo downloader that saves SnackVideo clips without the watermark as MP4 files — no app or login.",
    intro: [
      "Free Online Video Downloader's SnackVideo downloader saves short clips without the watermark, keeping them clean for offline viewing, editing or re-sharing. Paste the SnackVideo link and download an MP4 in the best quality available.",
      "There is no app to install and no SnackVideo login required. Free Online Video Downloader works on iPhone, Android and desktop, so you can quickly keep the clips you enjoy or reuse trending sounds as MP3.",
    ],
    features: [
      { title: "No watermark", text: "Download SnackVideo clips without the SnackVideo logo or username stamp." },
      { title: "Audio as MP3", text: "Extract the sound from a clip to reuse trending audio or keep a track." },
      { title: "Best quality", text: "Free Online Video Downloader grabs the highest resolution SnackVideo serves for the clip." },
      { title: "No app or login", text: "Only the public link is required — nothing to install." },
    ],
    formats:
      "SnackVideo downloads come as watermark-free MP4 video, with audio also available as MP3. Free Online Video Downloader saves the best resolution available. Only public clips can be downloaded.",
    useCases: [
      "Repost your own clips without the logo",
      "Save trending sounds as MP3",
      "Keep favourite short videos offline",
      "Collect reference footage for editing",
    ],
    faqs: [
      { q: "Does Free Online Video Downloader remove the SnackVideo watermark?", a: "Yes. SnackVideo clips are saved without the watermark so they are clean to re-share or edit." },
      { q: "Can I download the sound from a SnackVideo?", a: "Yes. Switch to the Audio (MP3) tab in the result to save the clip's audio as an MP3." },
      { q: "Do I need the SnackVideo app?", a: "No. Copy the clip's share link and paste it into Free Online Video Downloader — everything runs in the browser." },
      { q: "Can I download private clips?", a: "No. Only public SnackVideo clips can be downloaded." },
      { q: "What format are clips saved in?", a: "Clips download as MP4 video, with MP3 available for audio." },
      { q: "Is the SnackVideo downloader free?", a: "Yes, it is free with no sign-up." },
    ],
    keywords: ["snackvideo downloader", "download snackvideo without watermark", "snackvideo video download", "snackvideo mp3", "save snackvideo", "snack video download"],
  },

  douyin: {
    answer:
      "Free Online Video Downloader is a free Douyin downloader that saves Douyin videos in high quality without watermarks as MP4 files — no app or login.",
    intro: [
      "Free Online Video Downloader's Douyin downloader saves videos from China's TikTok without the watermark, delivering clean high-quality MP4 files. Paste the Douyin link and download the clip for offline viewing, editing or re-sharing.",
      "There is no app to install and no Douyin login required. Free Online Video Downloader works on iPhone, Android and desktop, and can also pull the original sound as an MP3 for creators who want to reuse a track.",
    ],
    features: [
      { title: "No watermark", text: "Download Douyin videos without the Douyin logo for a clean result." },
      { title: "HD quality", text: "Free Online Video Downloader grabs the highest resolution Douyin serves for the video." },
      { title: "Audio as MP3", text: "Save the original sound as an MP3 to reuse trending audio." },
      { title: "No app or login", text: "Only the public link is required — nothing to install." },
    ],
    formats:
      "Douyin downloads are saved as watermark-free MP4 video, with audio available as MP3. Free Online Video Downloader pulls the best resolution available. Only public videos can be downloaded.",
    useCases: [
      "Repost Douyin clips without the logo",
      "Save trending sounds as MP3",
      "Keep favourite videos offline",
      "Collect reference footage for editing",
    ],
    faqs: [
      { q: "Does Free Online Video Downloader remove the Douyin watermark?", a: "Yes. Douyin videos are saved without the watermark so they are clean to re-share or edit." },
      { q: "How do I copy a Douyin video link?", a: "Use the share button on the video, copy the link, and paste it into Free Online Video Downloader." },
      { q: "Can I save the audio from a Douyin video?", a: "Yes. Switch to the Audio (MP3) tab in the result to save the sound as an MP3." },
      { q: "Do I need the Douyin app?", a: "No. Everything runs in the browser — only the public link is needed." },
      { q: "What format are Douyin videos saved in?", a: "Videos download as MP4, with MP3 available for audio." },
      { q: "Is the Douyin downloader free?", a: "Yes, it is completely free with no sign-up." },
    ],
    keywords: ["douyin downloader", "download douyin video", "douyin no watermark", "douyin video download", "chinese tiktok downloader", "douyin mp4 download"],
  },
};

export function getArticle(slug: string): PlatformArticle | undefined {
  return articles[slug];
}
