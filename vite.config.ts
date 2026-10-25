import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/ai-text': {
        target: 'https://text.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai-text/, ''),
        headers: {
          'Origin': 'https://pollinations.ai',
          'Referer': 'https://pollinations.ai/',
        },
      },
    },
  },
})
