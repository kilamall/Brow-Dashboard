import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@buenobrows/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  build: {
    // Generate unique file names with content hash
    rollupOptions: {
      output: {
        // Add timestamp to force cache invalidation
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
    // Clear output directory before build
    emptyOutDir: true,
    // Generate manifest for cache busting
    manifest: true,
  },
  // Disable browser caching in dev mode
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
});
