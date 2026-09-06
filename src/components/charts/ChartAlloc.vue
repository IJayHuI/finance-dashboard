<template>
  <!-- 资产配置占比环形图 -->
  <n-card title="资产配置占比">
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
import { toDisplay, CHART_COLORS } from '../../utils/helpers'

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

/**
 * 获取图表文字颜色
 */
const textColor = () => isDark.value ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.55)'

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
 * 渲染环形图
 */
function render() {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chart) chart.destroy()

  // 设置 Chart.js 默认样式
  Chart.defaults.color = textColor()
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

  // 项目名称标签
  const labels = projects.value.map(p => p.name)
  // 各项目当前金额
  const data = projects.value.map(p => {
    const latest = financeStore.getLatestAsset(p.name)
    return toDisplayCurrency(latest ? latest.amount : 0, p.currency)
  })

  // 创建 Chart 实例
  chart = new Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        // 循环使用配色方案
        backgroundColor: projects.value.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        // 边框颜色与背景融合
        borderColor: isDark.value ? '#18181c' : '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { padding: 15, font: { size: 13 } },
        },
        tooltip: {
          callbacks: {
            label: c => {
              const total = c.dataset.data.reduce((a, b) => a + b, 0)
              const pct = total > 0 ? (c.parsed / total * 100).toFixed(1) : '0.0'
              return c.label + ': ' + symStr() + c.parsed.toFixed(2) + ' (' + pct + '%)'
            },
          },
        },
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
