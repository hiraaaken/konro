<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    v-bind="$attrs"
    @click="handleClick"
  >
    <Icon
      v-if="icon && iconPosition === 'left'"
      :name="icon"
      :class="iconClasses"
    />
    <span v-if="$slots.default" :class="textClasses">
      <slot />
    </span>
    <Icon
      v-if="icon && iconPosition === 'right'"
      :name="icon"
      :class="iconClasses"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

defineOptions({
  inheritAttrs: false
})

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  fullWidth: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Size classes
  {
    'px-3 py-1.5 text-sm': props.size === 'sm',
    'px-4 py-2 text-base': props.size === 'md',
    'px-6 py-3 text-lg': props.size === 'lg'
  },
  
  // Variant classes
  {
    'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 focus:ring-orange-500': props.variant === 'primary',
    'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500': props.variant === 'secondary',
    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': props.variant === 'danger',
    'text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500': props.variant === 'ghost'
  },
  
  // Full width
  {
    'w-full': props.fullWidth
  },
  
  // Loading/disabled state
  {
    'transform hover:scale-105': !props.disabled && !props.loading,
    'cursor-wait': props.loading
  }
])

const iconClasses = computed(() => [
  {
    'mr-2': props.iconPosition === 'left' && !!$slots.default,
    'ml-2': props.iconPosition === 'right' && !!$slots.default,
    'animate-spin': props.loading
  }
])

const textClasses = computed(() => [
  {
    'opacity-0': props.loading
  }
])

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>