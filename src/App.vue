/**
 * 应用根组件
 * 提供 Naive UI 全局配置、Pinia store 上下文
 * 处理加载状态和错误状态，然后渲染 DashboardView
 */
<script setup>
import { computed, onMounted } from 'vue'
import { zhCN, dateZhCN } from 'naive-ui'
import { useSettingsStore } from './stores/settings'
import { useFinanceStore } from './stores/finance'
import { useExchangeRate } from './composables/useExchangeRate'
import DashboardView from './views/DashboardView.vue'

// Naive UI 主题覆盖配置（品牌色：翡翠绿）
const themeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    primaryColorSuppl: '#36ad6a',
    borderRadius: '8px',
  }
}

const settings = useSettingsStore()
const finance = useFinanceStore()
const { fetchExchangeRate } = useExchangeRate()

// 当前 Naive UI 主题对象
const naiveTheme = computed(() => settings.naiveTheme)

// 应用启动时加载数据
onMounted(async () => {
  // 并行加载财务数据和汇率
  await finance.loadData()
  fetchExchangeRate()

  // 监听系统主题变化（auto 模式下自动响应）
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    // settings.naiveTheme 是 computed，会自动响应
  })
})
</script>

<template>
  <!-- Naive UI 全局配置 + 中文语言包 -->
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-layout position="absolute" style="min-height: 100vh">
      <n-layout-content style="padding: 0">
        <!-- 加载中 -->
        <div v-if="finance.loading" class="loading-wrap">
          <n-spin size="large" />
          <n-text depth="3" style="font-size: 14px; margin-top: 12px">正在从 Supabase 加载数据...</n-text>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="finance.loadError && finance.projects.length === 0" class="loading-wrap">
          <n-text type="error" style="font-size: 16px">加载失败</n-text>
          <n-text depth="3" style="font-size: 13px; margin-top: 8px">{{ finance.loadError }}</n-text>
          <n-button secondary type="primary" style="margin-top: 16px" @click="finance.loadData">重试</n-button>
        </div>

        <!-- 主内容 -->
        <DashboardView v-else />
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<style>
/* 加载全屏居中 */
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}
</style>
