<template>
  <!-- 投入/减少本金弹窗 -->
  <n-modal
    :show="show"
    preset="card"
    title="投入/减少本金"
    class="w-[500px] max-w-[90vw]"
    @update:show="v => emit('update:show', v)"
  >
    <n-form label-placement="top">
      <!-- 日期选择 -->
      <n-form-item label="日期">
        <n-date-picker v-model:value="form.date" type="date" class="w-full" />
      </n-form-item>

      <!-- 项目选择 -->
      <n-form-item label="项目">
        <n-select v-model:value="form.project" :options="projectOptions" class="w-full" />
      </n-form-item>

      <!-- 金额输入 -->
      <n-form-item label="金额">
        <n-input-number
          v-model:value="form.amount"
          placeholder="正数=投入本金，负数=减少本金"
          class="w-full"
        />
      </n-form-item>

      <!-- 提示文字 -->
      <n-text depth="3" class="text-xs">正数表示投入本金，负数表示减少本金</n-text>

      <!-- 操作按钮 -->
      <n-space justify="end" class="mt-4">
        <n-button secondary @click="emit('update:show', false)">取消</n-button>
        <n-button secondary type="primary" @click="handleSubmit">
          <template #icon>
            <n-icon :component="CheckRound" />
          </template>
          确认
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { NIcon } from 'naive-ui'
import { CheckRound } from '@vicons/material'
import { useFinanceStore } from '../../stores/finance'
import { fmtDate } from '../../utils/helpers'

// 定义 props
const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['update:show'])

// 使用财务 store
const financeStore = useFinanceStore()
const { projectOptions } = storeToRefs(financeStore)

// 表单数据
const form = reactive({
  date: Date.now(),
  project: null,
  amount: null,
})

// 监听弹窗显示状态，打开时重置表单
watch(() => props.show, (v) => {
  if (v) {
    form.date = Date.now()
    form.project = null
    form.amount = null
  }
})

/**
 * 提交投入/减少本金记录
 */
async function handleSubmit() {
  const dateStr = fmtDate(form.date)
  if (!dateStr || !form.project || form.amount === null) return
  const success = await financeStore.addInvest(dateStr, form.project, form.amount)
  if (success) {
    emit('update:show', false)
  }
}
</script>
