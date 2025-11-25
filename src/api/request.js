// 导入axios
import axios from 'axios'

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  // timeout: 5000,
})

// 配置响应拦截器
instance.interceptors.response.use(
  (res) => {
    if (res.status === 200) {
      return res.data
    } else {
      console.error('请求失败')
      return Promise.reject('请求失败')
    }
  },
  (err) => {
    return Promise.reject(err)
  }
)
// 导出实例
export default instance
