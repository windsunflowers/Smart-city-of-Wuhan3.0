import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 1. 引入 mock 插件
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    vue(),
    // 2. 添加 mock 插件配置
    viteMockServe({
      mockPath: 'mock',    // 你的 mock 文件夹名称
      localEnabled: true,  // 本地开发开启
      prodEnabled: true,   // 生产环境（打包后）也开启！
      // 关键：把 mock 服务注入到代码里
      injectCode: `
        import { setupProdMockServer } from './mockProdServer';
        setupProdMockServer();
      `,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 保留你原有的服务器配置
  server: {
    host: '127.0.0.1',
    port: 5174,
    https: false
  }
})