import { fileURLToPath } from "node:url";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Static archive of the ShellHacks 2026 landing page.
//
// Deliberately narrow compared to the glaucus client config: no varlock, no
// service worker, no dev proxy, no backend. Every route is prerendered and no
// code in src/ talks to an API or a CDN (see scripts/check-static.mjs).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://shellhacks.net",
  // GitHub Pages project builds are served from a subpath until the custom
  // domain resolves; `base` keeps asset URLs correct in that window.
  base: process.env.PUBLIC_BASE_PATH ?? "/",
  trailingSlash: "ignore",
  devToolbar: { enabled: false },
  integrations: [preact({ compat: true })],
  build: { format: "directory" },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // lucide-react's package "main" is a CJS bundle. Astro externalizes
        // deps during prerender, so the CJS build is loaded by Node and mixes
        // real React internals into the Preact render ("Cannot read
        // properties of undefined (reading 'context')"). Resolving to the ESM
        // entry keeps the same code path in every environment.
        "lucide-react": "lucide-react/dist/esm/lucide-react.mjs",
        react: "preact/compat",
        "react-dom": "preact/compat",
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@components": fileURLToPath(
          new URL("./src/components", import.meta.url),
        ),
        "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
        "@games": fileURLToPath(new URL("./src/games", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
        "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      },
    },
  },
});
