/**
 * vite.config.js — Vite build tool configuration
 *
 * Learning notes
 * ──────────────
 * The `server.proxy` section is the key piece that makes React + Django
 * development work smoothly:
 *
 *   Problem:
 *     React dev server runs on http://localhost:5173
 *     Django API runs on     http://localhost:8000
 *     Browsers block cross-origin requests (CORS)
 *
 *   Solution in development — Vite proxy:
 *     Any request from React to /api/* is silently forwarded by Vite to
 *     Django (port 8000).  From the browser's perspective everything is on
 *     the same origin (port 5173) so CORS is never involved.
 *
 *   Solution in production:
 *     You would put a reverse proxy (e.g. nginx) in front of both servers
 *     so they share a single domain — or configure CORS_ALLOWED_ORIGINS
 *     in Django settings for your production domain.
 *
 * The django-cors-headers package (settings.py CORS_ALLOWED_ORIGINS) is
 * still set up so you can test the API directly in a browser at port 8000.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api/* requests to the Django dev server
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,   // rewrites the Host header to match Django
      },
    },
  },
});

