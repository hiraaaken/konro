<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            :class="dialogClasses"
            role="dialog"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
          >
            <!-- Header -->
            <div v-if="title || $slots.header" class="mb-4">
              <slot name="header">
                <h3 :id="titleId" :class="titleClasses">
                  {{ title }}
                </h3>
              </slot>
            </div>

            <!-- Content -->
            <div :id="descriptionId" :class="contentClasses">
              <slot>
                <p v-if="description">{{ description }}</p>
              </slot>
            </div>

            <!-- Actions -->
            <div v-if="$slots.actions || showDefaultActions" :class="actionsClasses">
              <slot name="actions">
                <div v-if="showDefaultActions" class="flex space-x-3">
                  <Button
                    variant="outline"
                    @click="handleCancel"
                    :disabled="loading"
                    class="flex-1"
                  >
                    {{ cancelText }}
                  </Button>
                  <Button
                    :variant="confirmVariant"
                    @click="handleConfirm"
                    :loading="loading"
                    class="flex-1"
                  >
                    {{ confirmText }}
                  </Button>
                </div>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import Button from './Button.vue'

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showDefaultActions?: boolean
  cancelText?: string
  confirmText?: string
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning'
  loading?: boolean
  closeOnBackdrop?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showDefaultActions: true,
  cancelText: 'キャンセル',
  confirmText: '確認',
  confirmVariant: 'primary',
  loading: false,
  closeOnBackdrop: true
})

const emit = defineEmits<Emits>()

const titleId = useId()
const descriptionId = useId()

const dialogClasses = computed(() => [
  'bg-white rounded-lg p-6 shadow-xl max-w-full',
  {
    'w-full max-w-sm': props.size === 'sm',
    'w-full max-w-md': props.size === 'md',
    'w-full max-w-lg': props.size === 'lg',
    'w-full max-w-2xl': props.size === 'xl'
  }
])

const titleClasses = computed(() => [
  'text-lg font-bold text-gray-800'
])

const contentClasses = computed(() => [
  'text-gray-600 mb-6'
])

const actionsClasses = computed(() => [
  'flex-shrink-0'
])

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>