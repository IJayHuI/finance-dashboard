/**
 * 首页视图
 * 整合所有组件，构成完整的大屏页面
 */
<script setup>
import { ref, h } from 'vue'
import { NIcon } from 'naive-ui'
import { useFinanceStore } from '../stores/finance'

// 组件导入
import HeaderBar from '../components/common/HeaderBar.vue'
import KpiCards from '../components/common/KpiCards.vue'
import ProjectTable from '../components/common/ProjectTable.vue'
import ProjectHistoryChart from '../components/charts/ProjectHistoryChart.vue'
import ChartCurrent from '../components/charts/ChartCurrent.vue'
import ChartPnl from '../components/charts/ChartPnl.vue'
import ChartAlloc from '../components/charts/ChartAlloc.vue'
import ChartTrend from '../components/charts/ChartTrend.vue'
import ProjectManageModal from '../components/modals/ProjectManageModal.vue'
import AddInvestModal from '../components/modals/AddInvestModal.vue'
import UpdateAssetModal from '../components/modals/UpdateAssetModal.vue'
import RecordDrawer from '../components/modals/RecordDrawer.vue'

import {
  FolderRound,
  PaymentsRound,
  EditRound,
  ArrowForwardRound,
} from '@vicons/material'

// store
const finance = useFinanceStore()

// 弹窗状态
const showProjectManage = ref(false)
const showAddInvest = ref(false)
const showUpdateAsset = ref(false)
const showAllInvest = ref(false)
const showAllAsset = ref(false)

</script>

<template>
  <div class="max-w-[1600px] mx-auto px-6 py-6 fade-in">
    <!-- 顶部栏 -->
    <HeaderBar />

    <!-- KPI 卡片 -->
    <KpiCards />

    <!-- 操作按钮区 -->
    <div class="mb-6 flex flex-wrap gap-3">
      <n-button secondary :render-icon="() => h(NIcon, null, { default: () => h(FolderRound) })" @click="showProjectManage = true">
        项目管理
      </n-button>
      <n-button secondary :render-icon="() => h(NIcon, null, { default: () => h(PaymentsRound) })" @click="showAddInvest = true">
        投入/减少本金
      </n-button>
      <n-button secondary :render-icon="() => h(NIcon, null, { default: () => h(EditRound) })" @click="showUpdateAsset = true">
        更新项目金额
      </n-button>
    </div>

    <!-- 项目历史趋势图（全宽） -->
    <ProjectHistoryChart class="mb-6" />

    <!-- 四个小图表网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <ChartCurrent />
      <ChartPnl />
      <ChartAlloc />
      <ChartTrend />
    </div>

    <!-- 项目明细表 -->
    <ProjectTable class="mb-6" />

    <!-- 记录表格（投入 + 资产） -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
      <!-- 投入记录 -->
      <n-card>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-semibold">
            投入记录 ({{ finance.investTableData.length }}/{{ finance.investTotalCount }})
          </h3>
          <n-space align="center" size="small">
            <n-select
              v-model:value="finance.investFilterProject"
              :options="finance.filterOptions"
              size="small"
              style="width: 140px"
            />
            <n-button size="small" secondary :render-icon="() => h(NIcon, null, { default: () => h(ArrowForwardRound) })" @click="showAllInvest = true">
              查看全部
            </n-button>
          </n-space>
        </div>
        <n-data-table
          :data="finance.investTableData"
          :columns="finance.investColumns"
          :bordered="false"
          size="small"
        />
      </n-card>

      <!-- 资产记录 -->
      <n-card>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-semibold">
            资产记录 ({{ finance.assetTableData.length }}/{{ finance.assetTotalCount }})
          </h3>
          <n-space align="center" size="small">
            <n-select
              v-model:value="finance.assetFilterProject"
              :options="finance.filterOptions"
              size="small"
              style="width: 140px"
            />
            <n-button size="small" secondary :render-icon="() => h(NIcon, null, { default: () => h(ArrowForwardRound) })" @click="showAllAsset = true">
              查看全部
            </n-button>
          </n-space>
        </div>
        <n-data-table
          :data="finance.assetTableData"
          :columns="finance.assetColumns"
          :bordered="false"
          size="small"
        />
      </n-card>
    </div>

    <!-- 弹窗 -->
    <ProjectManageModal v-model:show="showProjectManage" />
    <AddInvestModal v-model:show="showAddInvest" />
    <UpdateAssetModal v-model:show="showUpdateAsset" />
    <RecordDrawer v-model:show="showAllInvest" title="投入记录" type="invest" />
    <RecordDrawer v-model:show="showAllAsset" title="资产记录" type="asset" />
  </div>
</template>
