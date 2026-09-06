<template>
  <!-- 各项目盈亏柱状图（盈利绿色，亏损红色） -->
  <n-card title="各项目盈亏情况">
    <div class="chart-container h-[300px]">
      <canvas ref="chartRef"></canvas>
    </div>
  </n-card>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'
import { toDisplay } from '../../utils/helpers'

// 使用财务 store
const financeStore = useFinanceStore()
const { projects } = storeToRefs(financeStore)

// 使用设置 store
const settingsStore = useSettingsStore()
const { isDark, displayCurrency, exchangeRate } = storeToRefs(settingsStore)

// 图表 DOM 引用
const chartRef = ref(null)
// Chart 实例
let chart = null

// 盈亏颜色定义
const profitColor = '#18a058' // 盈利-绿色
const lossColor = '#d03050'   // 亏损-红色

/**
 * 获取图表文字颜色
 */
const textColor = () => isDark.value ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.55)'

/**
 * 获取图表网格线颜色
 */
const gridColor = () => isDark.value ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'

/**
 * 获取货币符号
 */
const symStr = () => displayCurrency.value === 'RMB' ? '¥' : '$'

/**
 * 金额转换为显示货币
 */
function toDisplayCurrency(amount, fromCurrency) {
  return toDisplay(amount, fromCurrency, displayCurrency.value, exchangeRate.value)
}

/**
 * 渲染盈亏柱状图
 */
function render() {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chart) chart.destroy()

  // 设置 Chart.js 默认样式
  Chart.defaults.color = textColor()
  Chart.defaults.borderColor = gridColor()
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

  // 项目名称标签
  const labels = projects.value.map(p => p.name)
  // 各项目盈亏金额（当前金额 - 本金）
  const pnls = projects.value.map(p => {
    const principal = financeStore.getPrincipal(p.name)
    const latest = financeStore.getLatestAsset(p.name)
    const current = latest ? latest.amount : 0
    return toDisplayCurrency(current - principal, p.currency)
  })

  // 创建 Chart 实例
  chart = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: pnls,
        // 根据盈亏设置颜色：盈利绿色，亏损红色，持平灰色
        backgroundColor: pnls.map(v => v > 0 ? profitColor : v < 0 ? lossColor : textColor()),
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => '盈亏: ' + symStr() + c.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
          },
        },
      },
      scales: {
        y: {
          ticks: { callback: v => symStr() + v.toLocaleString() },
          grid: { color: gridColor() },
        },
        x: { grid: { color: gridColor() } },
      },
    },
  })
}

// 组件挂载时渲染
onMounted(render)

// 监听数据变化，重新渲染
watch(
  () => [projects.value, isDark.value, displayCurrency.value],
  () => render(),
  { deep: true }
)

// 组件卸载时销毁图表
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
