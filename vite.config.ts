import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 项目页：https://<user>.github.io/agent-room-admin/
  base: '/agent-room-admin/',
})
