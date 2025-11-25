// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // ⬇️⬇️ 添加这个 server 配置 ⬇️⬇️
  server: {
    host: '127.0.0.1', // 使用 127.0.0.1 而不是 localhost
    port: 5174,        // 换一个新的端口号
    https: false       // 明确禁止 https
  }
  // ⬆️⬆️ 添加到这里 ⬆️⬆️
})