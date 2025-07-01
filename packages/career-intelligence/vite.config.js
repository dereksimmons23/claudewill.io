import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/career/',
  build: {
    outDir: '../../career',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})
