// Standalone Vite config — no @lovable.dev/vite-tanstack-config dependency.
// Replicates only what a production `vite build` needs from that wrapper:
// Tailwind, tsconfig path aliases, TanStack Start, Nitro (node-server preset),
// and the React plugin. Dev-only Lovable editor integrations (devtools, HMR
// gate, asset proxy, error-reporting bridges) are intentionally omitted —
// they only ever activated for `vite dev` inside the Lovable sandbox.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      // Redirect TanStack Start's bundled server entry to src/server.ts
      // (our SSR error wrapper). nitro/vite builds from this.
      server: { entry: "server" },
    }),
    // Plain Node server output (.output/server/index.mjs) — what our
    // Dockerfile runs with `node .output/server/index.mjs`.
    nitro({ preset: "node-server" }),
    viteReact(),
  ],
});
