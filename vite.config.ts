import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: 'localhost',
    port: 8888,
    proxy: {
      '/api': {
        target: 'http://bookstore.test',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../public/assets',
    emptyOutDir: true,
  },
})
