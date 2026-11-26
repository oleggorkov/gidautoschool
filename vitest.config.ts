import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/gidautoschool/",
  },
  tanstackStart: {
    server: {
      entry: "server",
    },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/_shell.html",
        crawlLinks: false,
      },
    },
  },
});
