// The Lovable wrapper already installs TanStack Start, React, Tailwind,
// tsconfig paths, and the development/build integrations used by this project.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/gidautoschool/",
  },
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
        crawlLinks: false,
      },
    },
  },
});
