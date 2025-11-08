import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: path.resolve(__dirname),
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['11bdc89d-ee3a-40ac-8fd6-ab284936fd6d-00-b1jfvzdfu0qe.sisko.replit.dev'],
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});