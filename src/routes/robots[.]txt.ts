import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  ROBOTS_KEY,
  defaultRobots,
  readContentOverride,
} from "@/lib/seo-sitemap.server";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const override = await readContentOverride(ROBOTS_KEY);
        const text = override ?? defaultRobots();

        return new Response(text, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
