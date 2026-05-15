import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: process.env.VITE_BASE_PATH || "/react-vite-deployment",
  server: {
    proxy: {
      // Any request to /api/v1/* is forwarded to the deployed Render backend
      '/api/v1': {
        target: 'https://airbnb-xr0i.onrender.com',
        changeOrigin: true,   
        secure: true,
      },
    },
  },
})