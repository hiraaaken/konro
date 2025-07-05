<template>
  <div class="form-field">
    <!-- Label -->
    <label
      v-if="label"
      :for="fieldId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Field -->
    <div class="relative">
      <Input
        :id="fieldId"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :error="hasError"
        :size="size"
        :model-value="modelValue"
        @update:model-value="handleUpdate"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- Field Icon -->
      <Icon
        v-if="icon"
        :name="icon"
        :class="iconClasses"
      />
    </div>

    <!-- Help Text -->
    <p
      v-if="helpText && !hasError"
      class="mt-1 text-sm text-gray-600"
    >
      {{ helpText }}
    </p>

    <!-- Error Message -->
    <p
      v-if="hasError"
      class="mt-1 text-sm text-red-600"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import Input from './Input.vue'
import Icon from './Icon.vue'

interface Props {
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  helpText?: string
  errorMessage?: string
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<Emits>()

const fieldId = useId()

const hasError = computed(() => !!props.errorMessage)

const labelClasses = computed(() => [
  'block text-sm font-medium mb-1',
  {
    'text-gray-700': !hasError.value,
    'text-red-700': hasError.value
  }
])

const iconClasses = computed(() => [
  'absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none',
  {
    'text-gray-400': !hasError.value,
    'text-red-400': hasError.value
  }
])

function handleUpdate(value: string | number) {
  emit('update:modelValue', value)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>