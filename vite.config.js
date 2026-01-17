import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FinApp - Finanzas Personales',
        short_name: 'FinApp',
        description: 'Sistema de gestión financiera personal con control de tarjetas, gastos y proyecciones',
        theme_color: '#FF2D55',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['finance', 'productivity'],
        shortcuts: [
          {
            name: 'Agregar Gasto',
            short_name: 'Gasto',
            description: 'Registrar un nuevo gasto',
            url: '/?action=expense',
            icons: [{ src: 'shortcut-expense.png', sizes: '96x96' }]
          },
          {
            name: 'Agregar Ingreso',
            short_name: 'Ingreso',
            description: 'Registrar un nuevo ingreso',
            url: '/?action=income',
            icons: [{ src: 'shortcut-income.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/finnhub\.io\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'finnhub-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart': ['chart.js', 'react-chartjs-2'],
          'crypto': ['crypto-js', 'lz-string'],
          'icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})
