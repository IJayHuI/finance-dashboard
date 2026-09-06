<template>
  <!-- 资产总额趋势折线图 -->
  <n-card title="资产总额趋势">
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
const { projects, assets } = storeToRefs(financeStore)

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
 * 获取图表网格线颜色
 */
const gridColor = () => isDark.value ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'

/**
 * 获取货币符号
 */
const symStr = () => displayCurrency.value === 'RMB' ? '¥' : '$'

/**
 * 获取项目币种
 */
function getProjectCurrency(name) {
  return financeStore.getProjectCurrency(name)
}

/**
 * 金额转换为显示货币
 */
function toDisplayCurrency(amount, fromCurrency) {
  return toDisplay(amount, fromCurrency, displayCurrency.value, exchangeRate.value)
}

/**
 * 渲染资产总额趋势折线图
 */
function render() {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chart) chart.destroy()

  // 设置 Chart.js 默认样式
  Chart.defaults.color = textColor()
  Chart.defaults.borderColor = gridColor()
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

  // 收集所有日期（去重并排序）
  const allDates = [...new Set(assets.value.map(a => a.date))].sort()
  const projectNames = projects.value.map(p => p.name)

  // 按项目填充每日资产数据（向前填充）
  const filled = {}
  projectNames.forEach(name => {
    const pdata = assets.value
      .filter(a => a.project === name)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    const dateMap = {}
    pdata.forEach(r => { dateMap[r.date] = r.amount })
    let lastVal = 0
    filled[name] = allDates.map(d => {
      if (dateMap[d] !== undefined) lastVal = dateMap[d]
      return lastVal
    })
  })

  // 计算每日总资产（所有项目汇总，转换为显示货币）
  const dailyTotals = allDates.map((d, i) =>
    projectNames.reduce((sum, name) =>
      sum + toDisplayCurrency(filled[name][i], getProjectCurrency(name)), 0
    )
  )

  // 创建 Chart 实例
  chart = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: allDates.map(d => d.slice(5)), // 只显示 MM-DD
      datasets: [{
        label: '总资产',
        data: dailyTotals,
        borderColor: '#2080f0',
        backgroundColor: 'rgba(32,128,240,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#2080f0',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          // Y 轴以"万"为单位显示
          ticks: { callback: v => symStr() + (v / 10000).toFixed(1) + '万' },
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
  () => [projects.value, assets.value, isDark.value, displayCurrency.value],
  () => render(),
  { deep: true }
)

// 组件卸载时销毁图表
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
