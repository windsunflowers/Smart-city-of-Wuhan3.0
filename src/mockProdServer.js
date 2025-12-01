import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'
// 假设你的 mock 数据入口是 mock/index.js。如果不是，请修改路径。
import mockModules from '../mock/index.js' 

export function setupProdMockServer() {
  createProdMockServer([
    ...mockModules
  ])
}