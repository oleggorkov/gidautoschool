// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // Отключаем автоматический обход, чтобы избежать ошибки 404
    prerender: {
      enabled: true,
      crawlLinks: false, 
    },
  },
  vite: {
    base: '/gidautoschool/',
    // 👇 Явно указываем серверный вход для Vite
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            input: './src/server.ts',
          },
        },
      },
    },
  },
  nitro: {
    preset: 'static',
  },
});
