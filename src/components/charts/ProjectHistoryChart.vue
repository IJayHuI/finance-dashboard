<template>
  <!-- 项目历史趋势图：本金累计 + 项目金额 双曲线 -->
  <n-card class="fade-in mb-6">
    <!-- 标题栏 + 项目选择器 -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-base font-semibold m-0">项目历史趋势</h3>
      <n-space align="center" size="small">
        <n-text depth="3" class="text-xs">选择项目</n-text>
        <n-select
          :value="selectedProjectHistory"
          :options="projectOptions"
          size="small"
          class="w-[200px]"
          @update:value="onSelectProject"
        />
      </n-space>
    </div>
    <!-- 图表容器 -->
    <div class="chart-container h-[340px]">
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
const { projects, investments, assets, projectOptions, selectedProjectHistory } = storeToRefs(financeStore)

// 使用设置 store
const settingsStore = useSettingsStore()
const { isDark, displayCurrency, exchangeRate } = storeToRefs(settingsStore)

// 图表 DOM 引用
const chartRef = ref(null)
// Chart 实例
let chart = null

/**
 * 获取图表文字颜色（根据明暗主题）
 */
const textColor = () => isDark.value ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.55)'

/**
 * 获取图表网格线颜色（根据明暗主题）
 */
const gridColor = () => isDark.value ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'

/**
 * 获取货币符号
 */
const symStr = () => displayCurrency.value === 'RMB' ? '¥' : '$'

/**
 * 切换选中的项目
 * @param {string} name - 项目名称
 */
function onSelectProject(name) {
  financeStore.selectedProjectHistory = name
}

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
 * 渲染图表
 */
function render() {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chart) {
    chart.destroy()
    chart = null
  }

  const projName = selectedProjectHistory.value
  if (!projName) return

  // 设置 Chart.js 默认样式
  Chart.defaults.color = textColor()
  Chart.defaults.borderColor = gridColor()
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

  const projCurrency = getProjectCurrency(projName)

  // 收集所有日期（投入记录 + 资产记录）
  const investDates = investments.value.filter(i => i.project === projName).map(i => i.date)
  const assetDates = assets.value.filter(a => a.project === projName).map(a => a.date)
  const allDates = [...new Set([...investDates, ...assetDates])].sort()

  if (allDates.length === 0) return

  // 计算累计本金数据（按日期填充）
  const investSorted = investments.value
    .filter(i => i.project === projName)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  let cumPrincipal = 0
  const principalMap = {}
  investSorted.forEach(r => {
    cumPrincipal += r.amount
    principalMap[r.date] = cumPrincipal
  })
  let lastP = 0
  const principalData = allDates.map(d => {
    if (principalMap[d] !== undefined) lastP = principalMap[d]
    return toDisplayCurrency(lastP, projCurrency)
  })

  // 计算资产金额数据（按日期填充）
  const assetSorted = assets.value
    .filter(a => a.project === projName)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const assetMap = {}
  assetSorted.forEach(r => { assetMap[r.date] = r.amount })
  let lastA = 0
  const assetData = allDates.map(d => {
    if (assetMap[d] !== undefined) lastA = assetMap[d]
    return toDisplayCurrency(lastA, projCurrency)
  })

  // 创建 Chart 实例
  chart = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: allDates.map(d => d.slice(5)), // 只显示 MM-DD
      datasets: [
        {
          label: '本金累计',
          data: principalData,
          borderColor: '#2080f0',
          backgroundColor: 'rgba(32,128,240,0.08)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#2080f0',
          borderWidth: 2,
        },
        {
          label: '项目金额',
          data: assetData,
          borderColor: '#18a058',
          backgroundColor: 'rgba(24,160,88,0.08)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#18a058',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { padding: 15, font: { size: 12 }, color: textColor() },
        },
        tooltip: {
          callbacks: {
            label: c => c.dataset.label + ': ' + symStr() + c.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
          },
        },
      },
      scales: {
        y: {
          ticks: { callback: v => symStr() + v.toLocaleString(), color: textColor() },
          grid: { color: gridColor() },
        },
        x: {
          ticks: { color: textColor() },
          grid: { color: gridColor() },
        },
      },
    },
  })
}

// 组件挂载时渲染
onMounted(render)

// 监听数据变化，重新渲染
watch(
  () => [selectedProjectHistory.value, investments.value, assets.value, isDark.value, displayCurrency.value],
  () => render(),
  { deep: true }
)

// 组件卸载时销毁图表实例
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
