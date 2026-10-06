import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "preact",
    },
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "@": src,
      "@components": `${src}/components`,
      "@data": `${src}/data`,
      "@games": `${src}/games`,
      "@styles": `${src}/styles`,
      "@utils": `${src}/utils`,
      "@assets": `${src}/assets`,
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
  },
});
