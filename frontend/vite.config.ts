import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { getFirebaseClientConfig } from './src/utils/firebaseClientConfig';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), 'VITE_');
  const firebaseConfig = getFirebaseClientConfig(clientEnv);

  // Never produce a distributable bundle that targets a loopback emulator or
  // the local demo project. In production that configuration can crash the
  // Firebase module during startup, and would not be usable by testers anyway.
  if (command === 'build') {
    if (clientEnv.VITE_USE_FIREBASE_EMULATORS === 'true') {
      throw new Error(
        'Production builds cannot use Firebase emulators. Set VITE_USE_FIREBASE_EMULATORS=false and configure a real Firebase staging/production project.',
      );
    }

    if (firebaseConfig.projectId === 'demo-mood-log-local') {
      throw new Error(
        'Production builds cannot target demo-mood-log-local. Configure a real Firebase staging/production project first.',
      );
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/account-action(?:\/|\?|$)/],
        },
        includeAssets: [
          'icons/mood-log-icon.svg',
          'icons/mood-log-app-192.png',
          'icons/mood-log-app-512.png',
          'icons/apple-touch-icon.png',
        ],
        manifest: {
          lang: 'es',
          name: 'Mood Log App',
          short_name: 'MoodLog',
          description: 'Tu compañero personal para el seguimiento del estado de ánimo',
          theme_color: '#101414',
          background_color: '#f7f6f2',
          display: 'standalone',
          icons: [
            {
              src: 'icons/mood-log-app-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/mood-log-app-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
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
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
        },
      },
    },
  };
});
