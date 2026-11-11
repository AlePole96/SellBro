import { defineConfig } from 'vitest/config'
import { loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function normalizeBase(value: string | undefined): string {
  const folder = (value ?? '').trim().replace(/^\/+|\/+$/g, '')
  return folder ? `/${folder}/` : '/'
}

function apacheConfig(base: string): Plugin {
  return {
    name: 'sellbro-apache-config',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '.htaccess',
        source: `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${base}
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${base}index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`,
      })
    },
  }
}

function dropBundledWasm(): Plugin {
  return {
    name: 'sellbro-drop-bundled-wasm',
    apply: 'build',
    // The cutout library downloads its own runtime, so onnxruntime's 24 MB copy is never requested
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.wasm')) delete bundle[fileName]
      }
    },
  }
}

export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // The dev server always runs at the root; only the published build lives in a subfolder
  const base =
    command === 'build' || isPreview ? normalizeBase(env.APP_BASE_PATH) : '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      apacheConfig(base),
      dropBundledWasm(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globIgnores: ['**/ort.*'],
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
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: `${base}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      include: ['tests/**/*.test.ts'],
    },
  }
})
