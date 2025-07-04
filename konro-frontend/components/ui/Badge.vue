<template>
  <span
    :class="badgeClasses"
    v-bind="$attrs"
  >
    <Icon
      v-if="icon"
      :name="icon"
      :size="iconSize"
      class="mr-1"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

defineOptions({
  inheritAttrs: false
})

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  rounded: false
})

const badgeClasses = computed(() => [
  'inline-flex items-center font-medium',
  
  // Size classes
  {
    'px-2 py-0.5 text-xs': props.size === 'sm',
    'px-2.5 py-1 text-sm': props.size === 'md',
    'px-3 py-1.5 text-base': props.size === 'lg'
  },
  
  // Shape classes
  {
    'rounded-full': props.rounded,
    'rounded': !props.rounded
  },
  
  // Variant classes
  {
    'bg-orange-100 text-orange-800': props.variant === 'primary',
    'bg-gray-100 text-gray-800': props.variant === 'secondary',
    'bg-green-100 text-green-800': props.variant === 'success',
    'bg-yellow-100 text-yellow-800': props.variant === 'warning',
    'bg-red-100 text-red-800': props.variant === 'danger',
    'bg-blue-100 text-blue-800': props.variant === 'info'
  }
])

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm': return 'xs'
    case 'md': return 'sm'
    case 'lg': return 'md'
    default: return 'sm'
  }
})
</script>