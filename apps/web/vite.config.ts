import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // El frontend consume el código fuente del paquete compartido (sin paso de build previo)
      '@electricos/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Dependencias en un chunk propio (cambian menos que el código de la app y se cachean mejor)
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          iconos: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
