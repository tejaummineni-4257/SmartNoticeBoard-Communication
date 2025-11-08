import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Change the target to your Render backend URL
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://smartnoticeboard-communication.onrender.com", // Your Render backend URL
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
})
