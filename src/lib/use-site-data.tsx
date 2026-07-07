import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSiteData } from "@/lib/site-content.functions";
import {
  mergeContent,
  resolvePlatforms,
  enabledPlatforms,
  toolSettingMap,
  type ContentValue,
  type PublicSiteData,
  type ResolvedPlatform,
} from "@/lib/site-content";
import { adMap, type AdMap } from "@/lib/ads";

const EMPTY: PublicSiteData = { content: {}, tools: [], ads: [] };

const SiteDataContext = createContext<PublicSiteData>(EMPTY);

export const SITE_DATA_QUERY_KEY = ["site-data"] as const;

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: SITE_DATA_QUERY_KEY,
    queryFn: () => getPublicSiteData(),
    staleTime: 60_000,
  });
  return (
    <SiteDataContext.Provider value={data ?? EMPTY}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteData(): PublicSiteData {
  return useContext(SiteDataContext);
}

/** Merged (defaults + saved override) content for a page key. */
export function useSiteContent(key: string): ContentValue {
  const { content } = useSiteData();
  return mergeContent(key, content[key]);
}

/** Only enabled tools, with saved text overrides applied. */
export function useEnabledPlatforms(): ResolvedPlatform[] {
  const { tools } = useSiteData();
  return enabledPlatforms(toolSettingMap(tools));
}

/** All tools (including disabled), with overrides applied. */
export function useAllPlatforms(): ResolvedPlatform[] {
  const { tools } = useSiteData();
  return resolvePlatforms(toolSettingMap(tools));
}

/** Enabled ads keyed by placement. */
export function useAds(): AdMap {
  const { ads } = useSiteData();
  return adMap(ads);
}


export function useBranding() {
  const c = useSiteContent("branding");
  return {
    siteName: typeof c.siteName === "string" ? c.siteName : "Free Online Video Downloader",
    footerTagline:
      typeof c.footerTagline === "string"
        ? c.footerTagline
        : "Fast, free video & audio downloads from your favourite platforms — no sign-up, no clutter.",
    supportEmail: typeof c.supportEmail === "string" ? c.supportEmail : "support@snagvid.app",
  };
}
