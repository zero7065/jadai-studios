import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const projectRoot = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.resolve('.');

export default defineConfig(({mode}) => {
  // Load ALL env vars (no prefix filter) so server .env values reach `define` below.
  const env = loadEnv(mode, projectRoot, '');

  // Browser code reads process.env.NEXT_PUBLIC_* directly — Vite does not inject
  // these automatically (that's a Next.js behaviour), so define them explicitly.
  const clientEnv: Record<string, string> = {};
  for (const key of [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
  ]) {
    clientEnv[`process.env.${key}`] = JSON.stringify(env[key] || '');
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    define: clientEnv,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
