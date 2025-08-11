import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ include: /\.(j|t)sx?$/ })], // ← include .js/.ts as well
  server: { port: 5173, host: true }
})
