import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: process.env.VITE_BASE_PATH,
  // server: {
  //   proxy: {
  //     '/api/v1': {
  //       target: 'https://airbnb-xr0i.onrender.com',
  //       changeOrigin: true,   
  //       secure: true,
  //     },
  //   },
  // },
})