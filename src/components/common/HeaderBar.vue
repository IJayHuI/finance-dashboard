<template>
  <!-- 顶部导航栏：标题 + 汇率 + 主题切换 + 货币切换 -->
  <div class="fade-in flex justify-between items-center mb-6 flex-wrap gap-4">
    <!-- 左侧标题 -->
    <h1 class="text-[26px] font-bold m-0">
      <n-text type="primary">理财资产管理大屏</n-text>
    </h1>

    <!-- 右侧操作区 -->
    <div class="flex items-center gap-3 flex-wrap">
      <!-- 汇率显示区域 -->
      <n-space align="center" size="small">
        <n-text depth="3" class="text-xs">汇率: 1 USD =</n-text>
        <n-text type="primary" strong class="text-sm">
          {{ rateLoading ? '获取中...' : exchangeRate.toFixed(4) }}
        </n-text>
        <n-text depth="3" class="text-xs">RMB</n-text>
        <!-- 刷新汇率按钮 -->
        <n-button size="small" secondary @click="handleRefreshRate">
          <template #icon>
            <n-icon :component="RefreshRound" />
          </template>
          刷新
        </n-button>
      </n-space>

      <!-- 主题切换按钮组 -->
      <n-button-group size="small">
        <n-button
          secondary
          :type="themeMode === 'dark' ? 'primary' : 'default'"
          @click="handleSetTheme('dark')"
        >
          <template #icon>
            <n-icon :component="DarkModeRound" />
          </template>
          暗色
        </n-button>
        <n-button
          secondary
          :type="themeMode === 'light' ? 'primary' : 'default'"
          @click="handleSetTheme('light')"
        >
          <template #icon>
            <n-icon :component="LightModeRound" />
          </template>
          亮色
        </n-button>
        <n-button
          secondary
          :type="themeMode === 'auto' ? 'primary' : 'default'"
          @click="handleSetTheme('auto')"
        >
          <template #icon>
            <n-icon :component="SettingsSystemDaydreamRound" />
          </template>
          系统
        </n-button>
      </n-button-group>

      <!-- 货币切换按钮组 -->
      <n-button-group size="small">
        <n-button
          secondary
          :type="displayCurrency === 'RMB' ? 'primary' : 'default'"
          @click="handleSetCurrency('RMB')"
        >
          <template #icon>
            <n-icon :component="CurrencyYuanRound" />
          </template>
          RMB
        </n-button>
        <n-button
          secondary
          :type="displayCurrency === 'USD' ? 'primary' : 'default'"
          @click="handleSetCurrency('USD')"
        >
          <template #icon>
            <n-icon :component="AttachMoneyRound" />
          </template>
          USD
        </n-button>
      </n-button-group>

      <!-- 编辑模式按钮 -->
      <n-button
        v-if="!isEditing"
        size="small"
        secondary
        type="success"
        @click="handleEnterEdit"
      >
        <template #icon>
          <n-icon :component="EditNoteRound" />
        </template>
        开启编辑
      </n-button>
      <n-button
        v-else
        size="small"
        secondary
        type="warning"
        @click="handleExitEdit"
      >
        <template #icon>
          <n-icon :component="LogoutRound" />
        </template>
        退出编辑
      </n-button>
    </div>
  </div>

  <!-- 密码验证弹窗 -->
  <EditPasswordModal v-model:show="showPasswordModal" />
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NIcon } from 'naive-ui'
import {
  RefreshRound,
  DarkModeRound,
  LightModeRound,
  SettingsSystemDaydreamRound,
  CurrencyYuanRound,
  AttachMoneyRound,
  EditNoteRound,
  LogoutRound,
} from '@vicons/material'
import { useSettingsStore } from '../../stores/settings'
import { useExchangeRate } from '../../composables/useExchangeRate'
import EditPasswordModal from '../modals/EditPasswordModal.vue'

// 使用设置 store
const settingsStore = useSettingsStore()
const { themeMode, displayCurrency, exchangeRate, rateLoading, isEditing } = storeToRefs(settingsStore)

// 汇率获取方法
const { fetchExchangeRate } = useExchangeRate()

// 密码弹窗
const showPasswordModal = ref(false)

/**
 * 开启编辑模式（弹出密码框）
 */
function handleEnterEdit() {
  showPasswordModal.value = true
}

/**
 * 退出编辑模式
 */
function handleExitEdit() {
  settingsStore.exitEditMode()
}

/**
 * 刷新汇率
 */
function handleRefreshRate() {
  fetchExchangeRate()
}

/**
 * 设置主题模式
 * @param {string} mode - 'dark' | 'light' | 'auto'
 */
function handleSetTheme(mode) {
  settingsStore.setTheme(mode)
}

/**
 * 设置显示货币
 * @param {string} currency - 'RMB' | 'USD'
 */
function handleSetCurrency(currency) {
  settingsStore.setCurrency(currency)
}
</script>
