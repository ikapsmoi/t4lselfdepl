import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const servePublicDirectoryIndexes = (root: string) => ({
  name: 'serve-public-directory-indexes',
  configureServer(server: { middlewares: { use: (handler: (req: { method?: string; url?: string }, res: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((req, _res, next) => {
      if (req.method !== 'GET' || !req.url) {
        next();
        return;
      }

      const requestUrl = new URL(req.url, 'http://localhost');
      if (!requestUrl.pathname.endsWith('/') || requestUrl.pathname === '/') {
        next();
        return;
      }

      const indexPath = path.join(root, requestUrl.pathname, 'index.html');
      if (fs.existsSync(indexPath)) {
        req.url = `${requestUrl.pathname}index.html${requestUrl.search}`;
      }
      next();
    });
  },
  configurePreviewServer(server: { middlewares: { use: (handler: (req: { method?: string; url?: string }, res: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((req, _res, next) => {
      if (req.method !== 'GET' || !req.url) {
        next();
        return;
      }

      const requestUrl = new URL(req.url, 'http://localhost');
      const productRoute = requestUrl.pathname.match(/^\/trips\/([\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12})\/?$/i);
      if (productRoute) {
        const productIndexPath = path.resolve(process.cwd(), 'dist', 'trips', productRoute[1], 'index.html');
        if (fs.existsSync(productIndexPath)) {
          req.url = `/trips/${productRoute[1]}/index.html${requestUrl.search}`;
          next();
          return;
        }
      }

      if (!requestUrl.pathname.endsWith('/') || requestUrl.pathname === '/') {
        next();
        return;
      }

      const indexPath = path.join(root, requestUrl.pathname, 'index.html');
      if (fs.existsSync(indexPath)) {
        req.url = `${requestUrl.pathname}index.html${requestUrl.search}`;
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), servePublicDirectoryIndexes(path.resolve(__dirname, 'public'))],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        indiaTours: path.resolve(__dirname, 'india-tours/index.html'),
      },
    },
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: []
  },
});
