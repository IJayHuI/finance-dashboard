/**
 * 设置 Store
 * 管理主题模式、显示货币等用户偏好设置
 * 使用 pinia-plugin-persistedstate 持久化到 localStorage
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { darkTheme } from 'naive-ui'

export const useSettingsStore = defineStore('settings', () => {
  // 主题模式：dark / light / auto
  const themeMode = ref('dark')
  // 显示货币：RMB / USD
  const displayCurrency = ref('RMB')
  // 当前汇率（1 USD = ? RMB）
  const exchangeRate = ref(7.15)
  // 汇率来源信息
  const rateSource = ref('')
  // 汇率加载状态
  const rateLoading = ref(false)

  /**
   * 根据主题模式计算 Naive UI 主题对象
   */
  const naiveTheme = computed(() => {
    if (themeMode.value === 'light') return null
    if (themeMode.value === 'dark') return darkTheme
    // 跟随系统
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return isDark ? darkTheme : null
  })

  /** 是否为暗色模式 */
  const isDark = computed(() => !!naiveTheme.value)

  /** 设置主题模式 */
  function setTheme(mode) {
    themeMode.value = mode
  }

  /** 设置显示货币 */
  function setCurrency(currency) {
    displayCurrency.value = currency
  }

  /** 更新汇率 */
  function setExchangeRate(rate, source) {
    exchangeRate.value = rate
    rateSource.value = source
  }

  return {
    themeMode,
    displayCurrency,
    exchangeRate,
    rateSource,
    rateLoading,
    naiveTheme,
    isDark,
    setTheme,
    setCurrency,
    setExchangeRate,
  }
}, {
  // 持久化配置：只持久化主题和货币设置，汇率不持久化（每次重新获取）
  persist: {
    key: 'finance-settings',
    pick: ['themeMode', 'displayCurrency'],
  }
})
