import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function swVersionPlugin() {
  return {
    name: 'sw-version-plugin',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js')
      if (fs.existsSync(swPath)) {
        const content = fs.readFileSync(swPath, 'utf-8')
        const updated = content.replace(
          /const CACHE_VERSION = '[^']*';/,
          `const CACHE_VERSION = '${Date.now()}';`
        )
        fs.writeFileSync(swPath, updated, 'utf-8')
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), swVersionPlugin()],
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
