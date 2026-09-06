<template>
  <!-- 记录抽屉：投入记录 / 资产记录 通用 -->
  <n-drawer
    :show="show"
    :width="600"
    placement="right"
    @update:show="v => emit('update:show', v)"
  >
    <n-drawer-content :title="drawerTitle" closable>
      <!-- 筛选栏 -->
      <div class="flex items-center gap-3 mb-4 flex-wrap">
        <n-text depth="3" class="text-xs">筛选项目</n-text>
        <n-select
          :value="filterProject"
          :options="filterOptions"
          size="small"
          class="w-[200px]"
          @update:value="onFilterChange"
        />
        <n-text depth="3" class="text-xs ml-auto">共 {{ totalCount }} 条</n-text>
      </div>

      <!-- 数据表格 -->
      <n-data-table
        :data="tableData"
        :columns="columns"
        :bordered="false"
        size="small"
        :pagination="{ pageSize: 20 }"
      />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { computed, h } from 'vue'
import { storeToRefs } from 'pinia'
import { NTag, NText, NButton, NIcon, NPopconfirm } from 'naive-ui'
import { DeleteRound } from '@vicons/material'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'

// 定义 props
const props = defineProps({
  show: Boolean,
  /** 记录类型：'invest' | 'asset' */
  type: {
    type: String,
    default: 'invest',
  },
})

const emit = defineEmits(['update:show'])

// 使用财务 store
const financeStore = useFinanceStore()
const { filterOptions } = storeToRefs(financeStore)

// 使用设置 store（判断编辑模式）
const settingsStore = useSettingsStore()
const isEditing = computed(() => settingsStore.isEditing)

// 计算属性：根据类型获取对应的数据和筛选状态
const isInvest = computed(() => props.type === 'invest')

const filterProject = computed({
  get: () => isInvest.value ? financeStore.investFilterProject : financeStore.assetFilterProject,
  set: (v) => {
    if (isInvest.value) {
      financeStore.investFilterProject = v
    } else {
      financeStore.assetFilterProject = v
    }
  },
})

const tableData = computed(() =>
  isInvest.value ? financeStore.allInvestTableData : financeStore.allAssetTableData
)

const totalCount = computed(() =>
  isInvest.value ? financeStore.investTotalCount : financeStore.assetTotalCount
)

const drawerTitle = computed(() =>
  isInvest.value ? '投入记录' : '资产记录'
)

/**
 * 切换筛选项目
 */
function onFilterChange(val) {
  filterProject.value = val
}

/**
 * 删除记录
 */
function handleDelete(row) {
  if (isInvest.value) {
    financeStore.deleteInvest(row.id)
  } else {
    financeStore.deleteAsset(row.id)
  }
}

// 投入记录表列配置（编辑模式下显示删除操作列）
const investColumns = computed(() => {
  const cols = [
    { title: '日期', key: 'date', width: 120 },
    { title: '项目', key: 'project' },
    {
      title: '类型', key: 'type', width: 80,
      render: row => h(NTag, { size: 'small', type: row.typeType, round: true, bordered: false }, { default: () => row.type })
    },
    {
      title: '金额', key: 'amount',
      render: row => h(NText, { type: row.typeType }, { default: () => row.amount })
    },
  ]
  if (isEditing.value) {
    cols.push({
      title: '操作', key: 'action', width: 80,
      render: row => h(
        NPopconfirm,
        { onPositiveClick: () => handleDelete(row) },
        {
          trigger: () => h(
            NButton,
            { size: 'tiny', secondary: true, type: 'error' },
            {
              icon: () => h(NIcon, null, { default: () => h(DeleteRound) }),
              default: () => '删除'
            }
          ),
          default: () => '确定删除这条记录？'
        }
      )
    })
  }
  return cols
})

// 资产记录表列配置（编辑模式下显示删除操作列）
const assetColumns = computed(() => {
  const cols = [
    { title: '日期', key: 'date', width: 120 },
    { title: '项目', key: 'project' },
    { title: '金额', key: 'amount' },
  ]
  if (isEditing.value) {
    cols.push({
      title: '操作', key: 'action', width: 80,
      render: row => h(
        NPopconfirm,
        { onPositiveClick: () => handleDelete(row) },
        {
          trigger: () => h(
            NButton,
            { size: 'tiny', secondary: true, type: 'error' },
            {
              icon: () => h(NIcon, null, { default: () => h(DeleteRound) }),
              default: () => '删除'
            }
          ),
          default: () => '确定删除这条记录？'
        }
      )
    })
  }
  return cols
})

// 根据类型选择列配置
const columns = computed(() => isInvest.value ? investColumns.value : assetColumns.value)
</script>
