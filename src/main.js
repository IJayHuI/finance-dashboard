/**
 * 应用入口文件
 * 创建 Vue 应用实例，注册 Pinia、Naive UI 等插件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import naive from 'naive-ui'
import App from './App.vue'
import './assets/styles/main.css'

// 创建 Pinia 实例并注册持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 创建并挂载应用
const app = createApp(App)
app.use(pinia)
app.use(naive)
app.mount('#app')
