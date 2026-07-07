import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  SITEMAP_KEY,
  buildAutoSitemap,
  readContentOverride,
} from "@/lib/seo-sitemap.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const override = await readContentOverride(SITEMAP_KEY);
        const xml = override ?? (await buildAutoSitemap());

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
