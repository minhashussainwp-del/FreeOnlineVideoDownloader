import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://ahm7xmakki.com/api/alldl";

export const Route = createFileRoute("/api/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("url")?.trim();

        if (!target) {
          return Response.json(
            { success: false, message: "Missing 'url' query parameter." },
            { status: 400 },
          );
        }

        // Basic validation — must be a real http(s) URL
        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return Response.json(
            { success: false, message: "That doesn't look like a valid link." },
            { status: 400 },
          );
        }
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return Response.json(
            { success: false, message: "Only http and https links are supported." },
            { status: 400 },
          );
        }

        try {
          const upstream = await fetch(
            `${UPSTREAM}?url=${encodeURIComponent(target)}`,
            { headers: { accept: "application/json" } },
          );
          const data = await upstream.json();
          return Response.json(data, {
            headers: { "cache-control": "no-store" },
          });
        } catch {
          return Response.json(
            {
              success: false,
              message: "Could not reach the download service. Please try again.",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
