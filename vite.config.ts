import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globIgnores: ['**/*.wasm', '**/ort.*'],
        runtimeCaching: [
          {
            // Background-removal model (~95 MB): the CDN only caches it for 4 hours
            urlPattern: /^https:\/\/staticimgly\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'background-removal-model',
              expiration: { maxEntries: 80 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      manifest: {
        name: 'SellBro',
        short_name: 'SellBro',
        description: 'Gestione rivendita articoli usati',
        theme_color: '#0f1117',
        background_color: '#0f1117',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
})
