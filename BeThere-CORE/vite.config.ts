import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    include: ['react-map-gl'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  css: {
    preprocessorOptions: {
      css: {
        // This option is often used for resolving imports within CSS files, if Mapbox GL JS has such imports
        // You might need to adjust this based on how Mapbox GL JS imports its internal CSS assets
        // However, for direct import of the main CSS, it might not be strictly necessary here.
      },
    },
  },
  ssr: {
    noExternal: ['mapbox-gl'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
