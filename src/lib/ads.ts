// Shared, client-safe ad types & helpers.

export type AdPlacement = "top" | "bottom" | "left" | "right" | "download";

export type AdRow = {
  placement: AdPlacement;
  name: string | null;
  code: string | null;
  link_url: string | null;
  enabled: boolean;
};

export type AdMap = Partial<Record<AdPlacement, AdRow>>;

export const AD_PLACEMENTS: {
  placement: AdPlacement;
  label: string;
  description: string;
  /** download uses link_url; the others use raw ad code */
  usesLink: boolean;
}[] = [
  { placement: "top", label: "Top banner", description: "Shown above the downloader, under the header.", usesLink: false },
  { placement: "bottom", label: "Bottom banner", description: "Shown near the bottom, above the footer.", usesLink: false },
  { placement: "left", label: "Left rail", description: "Sticky ad on the left side (wide screens only).", usesLink: false },
  { placement: "right", label: "Right rail", description: "Sticky ad on the right side (wide screens only).", usesLink: false },
  { placement: "download", label: "Download-button ad", description: "Opens this link in a new tab when a visitor starts a download.", usesLink: true },
];

export function adMap(rows: AdRow[]): AdMap {
  const map: AdMap = {};
  for (const row of rows) map[row.placement] = row;
  return map;
}
