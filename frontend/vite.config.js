import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoRoot = path.resolve(__dirname, '..')

function resolveEnv(mode) {
  // Prefer frontend/.env, then fall back to the repository root .env.
  const rootEnv = loadEnv(mode, repoRoot, '')
  const frontendEnv = loadEnv(mode, __dirname, '')

  return {
    ...rootEnv,
    ...frontendEnv,
    ...process.env,
  }
}

export default defineConfig(({ mode }) => {
  const env = resolveEnv(mode)
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:18080'
  const deepSeekApiKey = (env.VITE_DEEPSEEK_API_KEY || '').trim()

  return {
    plugins: [vue()],
    define: {
      'import.meta.env.VITE_API_TARGET': JSON.stringify(apiTarget),
      'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(deepSeekApiKey),
    },
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
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'e2e/**',
      ],
      environmentOptions: {
        jsdom: {
          url: 'http://localhost/',
        },
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{js,vue}'],
        exclude: [
          'src/main.js',
          'src/test/**',
          '**/*.test.js',
        ],
      },
    },
  }
})
