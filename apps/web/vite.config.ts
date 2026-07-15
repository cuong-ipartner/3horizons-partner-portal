import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
// @ts-expect-error — local ESM plugin without types
import { apiPlugin } from './plugins/apiPlugin.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Server-side only secrets for Vite middleware (not bundled to client)
  if (env.XAI_API_KEY) process.env.XAI_API_KEY = env.XAI_API_KEY
  if (env.PROXYCURL_API_KEY) process.env.PROXYCURL_API_KEY = env.PROXYCURL_API_KEY

  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
