import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // '/api/v1'으로 시작하는 요청을 백엔드 서버로 전달합니다.
      '/api/v1': {
        target: 'http://127.0.0.1:8000', // FastAPI 백엔드 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ''), // 경로에서 /api/v1 제거
      },
    },
  },
})
