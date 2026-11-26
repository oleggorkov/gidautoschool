// The Lovable wrapper already installs TanStack Start, React, Tailwind,
// tsconfig paths, and the development/build integrations used by this project.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // GitHub Pages serves this repository below /gidautoschool/.
  vite: {
    base: "/gidautoschool/",
  },
  tanstackStart: {
    server: { entry: "server" },
    // GitHub Pages is static hosting: publish the SPA shell and let the
    // client-side router handle navigation.
    spa: {
      enabled: true,
      prerender: {
        enabled: true,
        crawlLinks: false,
        pages: [{ path: "/" }],
        outputPath: "index.html",
      },
    },
  },
  nitro: {
    preset: "static",
  },
});
