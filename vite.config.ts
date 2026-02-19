import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import AutoImport from "unplugin-auto-import/vite";
import path from "path";

export default defineConfig(() => ({
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      overlay: true, // Show error overlay in dev
    },
    watch: {
      // Prevent Vite from watching pnpm store and node_modules to avoid memory issues
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.local/**',  // Exclude pnpm store
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
    sourcemap: true, // Enable sourcemaps to help debug errors
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      onwarn(warning, warn) {
        // Show all warnings
        warn(warning);
      },
    },
    // Don't minify in production to make errors more readable
    minify: false,
  },
  plugins: [
    react(),
    AutoImport({
      // Auto-import any lucide-react icon the AI forgot to import
      // This prevents ReferenceError crashes from missing icon imports
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
    // Ensure single instance of React and React Router to prevent context issues
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    // Force single instance of React and React Router
    force: true,
  },
  // Show clear error messages
  clearScreen: false,
  logLevel: "info",
}));
