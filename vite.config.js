import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        demo: resolve(process.cwd(), 'index.html'),
        app: resolve(process.cwd(), 'app.html'),
        admin: resolve(process.cwd(), 'admin.html'),
      },
    },
  },
});