<template>
  <!-- 项目管理弹窗：添加、删除、切换币种 -->
  <n-modal
    :show="show"
    :title="title"
    preset="card"
    class="w-[600px] max-w-[90vw]"
    @update:show="v => emit('update:show', v)"
  >
    <!-- 项目列表区域 -->
    <div class="modal-scroll mb-4 max-h-[400px] overflow-y-auto">
      <!-- 空状态 -->
      <n-empty v-if="projectManageList.length === 0" description="暂无项目，请在下方添加" />
      <!-- 项目列表 -->
      <div v-else>
        <div
          v-for="p in projectManageList"
          :key="p.name"
          class="project-mgr-item flex justify-between items-center py-3 border-b border-b-gray-100 dark:border-b-gray-700 last:border-b-0"
        >
          <!-- 项目信息 -->
          <div class="project-mgr-info flex items-center gap-3 flex-wrap">
            <span class="project-mgr-name font-semibold">{{ p.name }}</span>
            <n-tag :type="p.currency === 'USD' ? 'info' : 'warning'" size="small" round :bordered="false">
              {{ p.currency }}
            </n-tag>
            <span class="project-mgr-meta text-xs opacity-70">
              本金 {{ p.principal }} | 当前 {{ p.current }}
            </span>
          </div>
          <!-- 操作按钮 -->
          <n-space>
            <n-button size="small" secondary @click="handleEditCurrency(p.name)">
              <template #icon>
                <n-icon :component="SwapHorizRound" />
              </template>
              切换币种
            </n-button>
            <n-popconfirm @positive-click="handleDelete(p.name)">
              <template #trigger>
                <n-button size="small" secondary type="error">
                  <template #icon>
                    <n-icon :component="DeleteRound" />
                  </template>
                  删除
                </n-button>
              </template>
              确定删除项目 "{{ p.name }}"？相关的投入记录和资产记录也会一并删除。
            </n-popconfirm>
          </n-space>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <n-divider class="my-2 mb-4" />

    <!-- 添加新项目表单 -->
    <div class="flex items-end gap-3 flex-wrap">
      <n-input
        v-model:value="newName"
        placeholder="新项目名称"
        class="flex-1 min-w-[160px]"
        @keyup.enter="handleAdd"
      />
      <n-select
        v-model:value="newCurrency"
        :options="currencyOptions"
        class="w-[140px]"
      />
      <n-button secondary type="primary" @click="handleAdd">
        <template #icon>
          <n-icon :component="AddRound" />
        </template>
        添加项目
      </n-button>
    </div>
  </n-modal>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NIcon } from 'naive-ui'
import {
  AddRound,
  DeleteRound,
  SwapHorizRound,
} from '@vicons/material'
import { useFinanceStore } from '../../stores/finance'

// 定义 props
defineProps({
  show: Boolean,
  title: { type: String, default: '项目管理' },
})

const emit = defineEmits(['update:show'])

// 使用财务 store
const financeStore = useFinanceStore()
const { projectManageList } = storeToRefs(financeStore)

// 新表单数据
const newName = ref('')
const newCurrency = ref('USD')

// 币种选项
const currencyOptions = [
  { label: '美元 (USD)', value: 'USD' },
  { label: '人民币 (RMB)', value: 'RMB' },
]

/**
 * 添加新项目
 */
async function handleAdd() {
  if (!newName.value.trim()) return
  const success = await financeStore.addProject(newName.value.trim(), newCurrency.value)
  if (success) {
    newName.value = ''
  }
}

/**
 * 切换项目币种
 * @param {string} name - 项目名称
 */
function handleEditCurrency(name) {
  financeStore.editProjectCurrency(name)
}

/**
 * 删除项目
 * @param {string} name - 项目名称
 */
function handleDelete(name) {
  financeStore.deleteProject(name)
}
</script>
