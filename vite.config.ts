// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";
import { handleApiRequest } from "./src/server/api-handler";

function apiServerPlugin(): Plugin {
  return {
    name: "api-server-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        try {
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:3000";
          const url = new URL(req.url, `${protocol}://${host}`);

          let body: string | undefined = undefined;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            body = Buffer.concat(chunks).toString("utf-8");
          }

          const webRequest = new Request(url.href, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: body ? body : undefined,
          });

          const webResponse = await handleApiRequest(webRequest);
          if (!webResponse) {
            return next();
          }

          res.statusCode = webResponse.status;
          webResponse.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });
          const resBody = await webResponse.text();
          res.end(resBody);
        } catch (err) {
          console.error("API middleware error:", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 3000,
    },
    plugins: [apiServerPlugin()],
  },
});
