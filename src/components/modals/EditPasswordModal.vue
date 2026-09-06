<template>
  <!-- 编辑密码验证弹窗 -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="开启编辑模式"
    :style="{ width: '400px' }"
    @after-leave="handleAfterLeave"
  >
    <n-form ref="formRef" :model="form" :rules="rules" size="large">
      <n-form-item path="password">
        <n-input
          v-model:value="form.password"
          type="password"
          show-password-on="click"
          placeholder="请输入编辑密码"
          @keyup.enter="handleConfirm"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button secondary @click="showModal = false">取消</n-button>
        <n-button type="primary" @click="handleConfirm">确认</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'success'])

// 使用 createDiscreteApi 创建消息实例（不需要 message-provider）
const { message } = createDiscreteApi(['message'])
const settingsStore = useSettingsStore()

// 双向绑定 show
const showModal = ref(props.show)
watch(() => props.show, (val) => {
  showModal.value = val
})
watch(showModal, (val) => {
  emit('update:show', val)
})

// 表单数据
const formRef = ref(null)
const form = ref({
  password: ''
})

// 表单校验规则
const rules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

/**
 * 确认验证
 */
function handleConfirm() {
  formRef.value?.validate((errors) => {
    if (errors) return
    const success = settingsStore.verifyEditPassword(form.value.password)
    if (success) {
      message.success('验证成功，已进入编辑模式')
      showModal.value = false
      emit('success')
    } else {
      message.error('密码错误')
    }
  })
}

/**
 * 弹窗关闭后重置表单
 */
function handleAfterLeave() {
  form.value.password = ''
}
</script>
