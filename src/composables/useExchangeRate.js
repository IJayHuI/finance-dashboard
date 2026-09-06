/**
 * 汇率获取组合式函数
 * 从 open.er-api.com 获取实时 USD/CNY 汇率
 */
import { createDiscreteApi } from 'naive-ui'
import { useSettingsStore } from '../stores/settings'

// 离散 API 创建消息实例
const { message } = createDiscreteApi(['message'])

export function useExchangeRate() {
  const settings = useSettingsStore()

  /**
   * 从外部 API 获取最新汇率
   */
  async function fetchExchangeRate() {
    settings.rateLoading = true
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await res.json()
      if (data && data.rates && data.rates.CNY) {
        const rate = data.rates.CNY
        const source = 'open.er-api.com | ' + new Date().toLocaleTimeString('zh-CN')
        settings.setExchangeRate(rate, source)
        message.success('汇率已更新: 1 USD = ' + rate.toFixed(4) + ' RMB')
      } else {
        throw new Error('Invalid response')
      }
    } catch {
      settings.rateSource = 'API获取失败，使用缓存汇率'
      message.error('汇率API获取失败，使用缓存汇率')
    } finally {
      settings.rateLoading = false
    }
  }

  return { fetchExchangeRate }
}
