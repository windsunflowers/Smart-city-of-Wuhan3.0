import { createApp } from 'vue'
import App from './App.vue'

// 引入全局样式
import './assets/styles/reset.css'

// 配置ElementUI
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 注册插件
import Mapbox from './plugins/mapbox.js'

createApp(App).use(ElementPlus).use(Mapbox).mount('#app')
