import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mood Log App',
        short_name: 'MoodLog',
        description: 'Tu compañero personal para el seguimiento del estado de ánimo',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const firebasePackage = id.match(/\/node_modules\/(@firebase|firebase)\/([^/]+)/);
          if (!firebasePackage) {
            return undefined;
          }

          const packageName =
            firebasePackage[1] === '@firebase' ? firebasePackage[2] : `sdk-${firebasePackage[2]}`;
          return `firebase-${packageName}`;
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
