import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 使用相对路径，兼容 GitHub Pages 子路径部署和本地开发
  base: './',
  plugins: [vue()],
  server: {
    port: 5173,
    open: true
  }
})
