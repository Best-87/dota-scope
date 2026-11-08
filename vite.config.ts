import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
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
