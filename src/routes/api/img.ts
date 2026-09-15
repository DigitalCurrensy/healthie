import { createFileRoute } from "@tanstack/react-router";
import { isAllowedPackHost } from "@/lib/catalog/pack-image";

const CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

export const Route = createFileRoute("/api/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("u") || "";
        let target: URL;
        try {
          target = new URL(raw);
        } catch {
          return new Response("bad url", { status: 400 });
        }
        if (target.protocol !== "https:" || !isAllowedPackHost(target.toString())) {
          return new Response("host not allowed", { status: 400 });
        }
        try {
          const up = await fetch(target.toString(), {
            headers: { Accept: "image/*", "User-Agent": "Healthie/1.0" },
            signal: AbortSignal.timeout(4000),
          });
          if (!up.ok) return new Response("upstream", { status: 502 });
          const type = up.headers.get("content-type") || "image/jpeg";
          if (!type.startsWith("image/")) return new Response("not an image", { status: 502 });
          const buf = await up.arrayBuffer();
          return new Response(buf, {
            status: 200,
            headers: {
              "Content-Type": type,
              "Cache-Control": CACHE,
              "CDN-Cache-Control": CACHE,
            },
          });
        } catch {
          return new Response("timeout", { status: 504 });
        }
      },
    },
  },
});
