import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-dom/server', 'react-router', 'react-router-dom', 'react-helmet-async', 'lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('maplibre-gl') || id.includes('react-map-gl')) {
            return 'maplibre-vendor';
          }

          if (id.includes('react-leaflet') || id.includes('leaflet')) {
            return 'leaflet-vendor';
          }

          if (id.includes('xlsx')) {
            return 'xlsx-vendor';
          }

          if (id.includes('react-select')) {
            return 'select-vendor';
          }

          if (id.includes('country-state-city')) {
            return 'geo-data-vendor';
          }

          if (id.includes('react-share')) {
            return 'share-vendor';
          }

          return undefined;
        },
      },
    },
  },
})
