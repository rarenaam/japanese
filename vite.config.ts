import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import AutoImport from "unplugin-auto-import/vite";
import path from "path";

export default defineConfig(() => ({
  // CRUCIAL VOOR GITHUB PAGES: 
  // Dit zorgt ervoor dat paden relatief zijn (./) in plaats van absoluut (/).
  base: '/japanese/', 

  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: true,
    hmr: {
      // clientPort 443 is nodig voor GitHub Codespaces/Gitpod omgevingen
      clientPort: 443,
      overlay: true, 
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.local/**',
        '**/pnpm-store/**',
      ],
    },
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      onwarn(warning, warn) {
        warn(warning);
      },
    },
    // Tip: Zet minify op 'terser' of 'esbuild' als je live gaat voor snelheid, 
    // maar false is prima voor debugging.
    minify: false,
  },
  plugins: [
    react(),
    AutoImport({
      packagePresets: ["lucide-react"],
      dts: false,
      viteOptimizeDeps: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    force: true,
  },
  clearScreen: false,
  logLevel: "info",
}));
