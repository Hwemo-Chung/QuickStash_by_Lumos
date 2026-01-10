import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 보안 강화: 자동 업데이트 대신 사용자 확인 필요
      registerType: 'prompt',
      // 수동 서비스 워커 제어 (권장)
      strategies: 'injectManifest',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'QuickStash',
        short_name: 'QuickStash',
        description: 'Save anything, find everything, organize nothing',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/',
        start_url: '/?utm_source=pwa',
        // HTTPS only - PWA는 보안 컨텍스트에서만 동작
        categories: ['productivity'],
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
      },
      workbox: {
        // 민감한 파일은 캐싱 제외
        globIgnores: [
          '**/node_modules/**/*',
          'src/**/*',
          '**/*.map', // 소스맵 제외
        ],
        // 파일 크기 제한 (5MB)
        maximumFileSizeToCacheInBytes: 5000000,
        // 보안: 자동 활성화 비활성화
        clientsClaim: false,
        skipWaiting: false,
        // 런타임 캐싱 강화
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
            // StaleWhileRevalidate: 캐시된 버전 먼저 사용, 백그라운드에서 업데이트
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 외부 폰트 캐싱
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
              },
            },
          },
        ],
      },
      injectManifest: {
        // 직접 service worker 제어 가능
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}',
        ],
        // 민감한 파일은 제외
        globIgnores: [
          '**/node_modules/**/*',
          'src/**/*',
          '**/*.map',
          '**/*.ts', // TypeScript 소스 제외
        ],
        // Service Worker 최대 크기 확인
        maximumFileSizeToCacheInBytes: 5000000,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(currentDirname, './src'),
    },
  },
});
