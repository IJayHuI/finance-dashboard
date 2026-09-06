<template>
  <!-- 项目明细表 -->
  <n-card class="fade-in mb-6" title="各项目明细">
    <n-data-table
      :data="projectTableData"
      :columns="columns"
      :bordered="false"
      size="small"
    />
  </n-card>
</template>

<script setup>
import { h } from 'vue'
import { storeToRefs } from 'pinia'
import { NTag, NText } from 'naive-ui'
import { useFinanceStore } from '../../stores/finance'

// 使用财务 store
const financeStore = useFinanceStore()
const { projectTableData } = storeToRefs(financeStore)

/**
 * 表格列配置
 * 使用 h() 渲染函数自定义单元格内容
 */
const columns = [
  // 项目名称
  {
    title: '项目',
    key: 'name',
    render: row => h('strong', null, row.name),
  },
  // 币种标签
  {
    title: '币种',
    key: 'currency',
    width: 100,
    render: row => h(
      NTag,
      { size: 'small', type: row.currency === 'USD' ? 'info' : 'warning', round: true, bordered: false },
      { default: () => row.currency }
    ),
  },
  // 本金
  { title: '本金', key: 'principal' },
  // 当前金额
  { title: '当前金额', key: 'current' },
  // 盈亏（带颜色）
  {
    title: '盈亏',
    key: 'pnl',
    render: row => h(NText, { type: row.statusType }, { default: () => row.pnl }),
  },
  // 收益率（带颜色）
  {
    title: '收益率',
    key: 'pnlPct',
    render: row => h(NText, { type: row.statusType }, { default: () => row.pnlPct }),
  },
  // 最新记录日期
  {
    title: '最新记录',
    key: 'latestDate',
    render: row => h(NText, { depth: 3 }, { default: () => row.latestDate }),
  },
  // 状态标签
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row => h(
      NTag,
      { type: row.statusType, size: 'small', round: true, bordered: false },
      { default: () => row.status }
    ),
  },
]
</script>
