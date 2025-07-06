<template>
  <span
    :class="iconClasses"
    :role="role"
    :aria-label="ariaLabel"
    v-bind="$attrs"
  >
    <template v-if="name === 'fire'">🔥</template>
    <template v-else-if="name === 'check'">✓</template>
    <template v-else-if="name === 'close'">✕</template>
    <template v-else-if="name === 'arrow-right'">→</template>
    <template v-else-if="name === 'arrow-left'">←</template>
    <template v-else-if="name === 'heart'">♥</template>
    <template v-else-if="name === 'star'">★</template>
    <template v-else-if="name === 'chat'">💬</template>
    <template v-else-if="name === 'user'">👤</template>
    <template v-else-if="name === 'settings'">⚙️</template>
    <template v-else-if="name === 'info'">ℹ️</template>
    <template v-else-if="name === 'warning'">⚠️</template>
    <template v-else-if="name === 'loading'">⏳</template>
    <template v-else>{{ name }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  animated: false,
  role: 'img'
})

defineOptions({
  inheritAttrs: false
})

interface Props {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info'
  animated?: boolean
  role?: string
  ariaLabel?: string
}

const iconClasses = computed(() => [
  'inline-block select-none',
  
  // Size classes
  {
    'text-xs': props.size === 'xs',
    'text-sm': props.size === 'sm',
    'text-base': props.size === 'md',
    'text-lg': props.size === 'lg',
    'text-xl': props.size === 'xl'
  },
  
  // Color classes
  {
    'text-orange-500': props.color === 'primary',
    'text-gray-500': props.color === 'secondary',
    'text-red-500': props.color === 'danger',
    'text-green-500': props.color === 'success',
    'text-yellow-500': props.color === 'warning',
    'text-blue-500': props.color === 'info'
  },
  
  // Animation classes
  {
    'animate-pulse': props.animated && ['fire', 'heart', 'star'].includes(props.name),
    'animate-spin': props.animated && ['loading', 'settings'].includes(props.name),
    'animate-bounce': props.animated && ['arrow-right', 'arrow-left'].includes(props.name)
  }
])
</script>