export type MediaInfo = {
  title?: string | null;
  author?: string | null;
  authorName?: string | null;
  creator?: string | null;
  thumbnail?: string | null;
  coverImage?: string | null;
  duration?: string | number | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  musicUrl?: string | null;
  downloadMp3?: string | null;
  qualities?: Array<{ quality?: string; label?: string; url?: string } | string> | null;
  platform?: string | null;
  description?: string | null;
};

export type DownloadResponse = {
  success: boolean;
  message?: string;
  mediaInfo?: MediaInfo | null;
  links?: string[];
};

export async function fetchDownload(videoUrl: string): Promise<DownloadResponse> {
  const res = await fetch(`/api/download?url=${encodeURIComponent(videoUrl)}`);
  const data = (await res.json()) as DownloadResponse;
  return data;
}
