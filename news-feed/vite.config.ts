import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      'crypto-influence-app-tunnel-r10xfpcn.devinapps.com',
      'crypto-influence-app-tunnel-gnhr2wam.devinapps.com',
      'crypto-influence-app-tunnel-sx1j5vh5.devinapps.com',
      'localhost',
    ],
  },
})
