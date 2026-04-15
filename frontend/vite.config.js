import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoRoot = path.resolve(__dirname, '..')
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:18080'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
    fs: {
      allow: [repoRoot],
    },
  },
})
