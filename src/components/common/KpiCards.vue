<template>
  <!-- KPI 卡片组：总资产、总本金、总盈亏、总收益率 -->
  <div class="kpi-grid fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- 总资产卡片 -->
    <n-card class="kpi-card">
      <n-text depth="3" class="text-xs">总资产 ({{ displayCurrency }})</n-text>
      <div class="kpi-value text-[30px] font-bold font-mono leading-tight mt-2">
        <n-text type="primary">{{ fmtMoney(totals.totalAssets) }}</n-text>
      </div>
      <n-text depth="3" class="text-xs">{{ totalsSub.assets }}</n-text>
    </n-card>

    <!-- 总本金卡片 -->
    <n-card class="kpi-card">
      <n-text depth="3" class="text-xs">总本金 ({{ displayCurrency }})</n-text>
      <div class="kpi-value text-[30px] font-bold font-mono leading-tight mt-2">
        <n-text type="primary">{{ fmtMoney(totals.totalPrincipal) }}</n-text>
      </div>
      <n-text depth="3" class="text-xs">{{ totalsSub.principal }}</n-text>
    </n-card>

    <!-- 总盈亏卡片 -->
    <n-card class="kpi-card">
      <n-text depth="3" class="text-xs">总盈亏 ({{ displayCurrency }})</n-text>
      <div class="kpi-value text-[30px] font-bold font-mono leading-tight mt-2">
        <n-text :type="pnlColor(totals.totalPnL)">{{ fmtMoney(totals.totalPnL) }}</n-text>
      </div>
      <n-text depth="3" class="text-xs">{{ totalsSub.pnl }}</n-text>
    </n-card>

    <!-- 总收益率卡片 -->
    <n-card class="kpi-card">
      <n-text depth="3" class="text-xs">总收益率</n-text>
      <div class="kpi-value text-[30px] font-bold font-mono leading-tight mt-2">
        <n-text :type="pnlColor(totals.totalPnLPct)">{{ fmtPct(totals.totalPnLPct) }}</n-text>
      </div>
      <n-text depth="3" class="text-xs">{{ totalsSub.rate }}</n-text>
    </n-card>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'

// 使用财务 store
const financeStore = useFinanceStore()
const { totals, totalsSub } = storeToRefs(financeStore)

// 使用设置 store
const settingsStore = useSettingsStore()
const { displayCurrency, exchangeRate } = storeToRefs(settingsStore)

/**
 * 格式化金额（使用当前显示货币和汇率）
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
function fmtMoney(amount) {
  const sym = displayCurrency.value === 'RMB' ? '¥' : '$'
  const sign = amount < 0 ? '-' : ''
  return sign + sym + Math.abs(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 格式化百分比
 * @param {number} v - 百分比数值
 * @returns {string} 格式化后的百分比
 */
function fmtPct(v) {
  return (v > 0 ? '+' : '') + v.toFixed(2) + '%'
}

/**
 * 根据盈亏返回文本颜色类型
 * @param {number} v - 数值
 * @returns {string} Naive UI 文本类型
 */
function pnlColor(v) {
  return v > 0 ? 'success' : v < 0 ? 'error' : 'default'
}
</script>

<style scoped>
/* KPI 数值字体：使用等宽字体增强数字可读性 */
.kpi-value {
  font-family: "SF Mono", Menlo, monospace;
}
</style>
