<template>
  <div class="fire-toggle-container">
    <div :class="toggleClasses" @click="handleToggle">
      <!-- Fire Icon with Animation -->
      <div :class="fireIconClasses">
        <Icon
          :name="fireIcon"
          :size="iconSize"
          :class="iconClasses"
        />
      </div>
      
      <!-- Toggle Switch -->
      <div :class="switchClasses">
        <div :class="knobClasses"></div>
      </div>
      
      <!-- Labels -->
      <div :class="labelClasses">
        <span :class="onLabelClasses">点火</span>
        <span :class="offLabelClasses">消火</span>
      </div>
    </div>
    
    <!-- Status Text -->
    <div v-if="showStatus" :class="statusClasses">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import type { FireLevel } from '~/types/domain'

interface Props {
  modelValue: boolean
  fireLevel?: FireLevel
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  showStatus?: boolean
  animated?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle', isOn: boolean): void
  (e: 'ignite'): void
  (e: 'extinguish'): void
}

const props = withDefaults(defineProps<Props>(), {
  fireLevel: 'medium',
  size: 'md',
  disabled: false,
  showStatus: true,
  animated: true
})

const emit = defineEmits<Emits>()

const toggleClasses = computed(() => [
  'flex flex-col items-center space-y-3 p-4 rounded-lg border-2 transition-all duration-300',
  'cursor-pointer select-none',
  {
    'border-orange-300 bg-orange-50 hover:bg-orange-100': props.modelValue && !props.disabled,
    'border-gray-300 bg-gray-50 hover:bg-gray-100': !props.modelValue && !props.disabled,
    'border-red-400 bg-red-50': props.modelValue && props.fireLevel === 'strong',
    'opacity-50 cursor-not-allowed': props.disabled,
    'shadow-lg': props.modelValue,
    'transform hover:scale-105': !props.disabled && props.animated
  }
])

const fireIconClasses = computed(() => [
  'relative transition-all duration-300',
  {
    'animate-pulse': props.modelValue && props.animated,
    'animate-bounce': props.modelValue && props.fireLevel === 'strong' && props.animated
  }
])

const fireIcon = computed(() => {
  if (!props.modelValue) return 'flame-off'
  
  switch (props.fireLevel) {
    case 'weak': return 'flame-weak'
    case 'medium': return 'flame-medium'
    case 'strong': return 'flame-strong'
    default: return 'flame'
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm': return '20'
    case 'md': return '32'
    case 'lg': return '48'
    default: return '32'
  }
})

const iconClasses = computed(() => [
  'transition-colors duration-300',
  {
    'text-orange-400': props.modelValue && props.fireLevel === 'weak',
    'text-orange-500': props.modelValue && props.fireLevel === 'medium',
    'text-red-500': props.modelValue && props.fireLevel === 'strong',
    'text-gray-400': !props.modelValue
  }
])

const switchClasses = computed(() => [
  'relative w-16 h-8 rounded-full transition-colors duration-300',
  {
    'bg-orange-400': props.modelValue && props.fireLevel !== 'strong',
    'bg-red-500': props.modelValue && props.fireLevel === 'strong',
    'bg-gray-300': !props.modelValue
  }
])

const knobClasses = computed(() => [
  'absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300',
  {
    'translate-x-8': props.modelValue,
    'translate-x-1': !props.modelValue
  }
])

const labelClasses = computed(() => [
  'flex justify-between w-full text-xs font-medium'
])

const onLabelClasses = computed(() => [
  'transition-colors duration-300',
  {
    'text-orange-600': props.modelValue,
    'text-gray-400': !props.modelValue
  }
])

const offLabelClasses = computed(() => [
  'transition-colors duration-300',
  {
    'text-gray-400': props.modelValue,
    'text-gray-600': !props.modelValue
  }
])

const statusClasses = computed(() => [
  'text-center text-sm font-medium mt-2 transition-colors duration-300',
  {
    'text-orange-600': props.modelValue && props.fireLevel !== 'strong',
    'text-red-600': props.modelValue && props.fireLevel === 'strong',
    'text-gray-500': !props.modelValue
  }
])

const statusText = computed(() => {
  if (!props.modelValue) return 'コンロは消火中です'
  
  switch (props.fireLevel) {
    case 'weak': return '弱火で点火中'
    case 'medium': return '中火で点火中'
    case 'strong': return '強火で点火中'
    default: return '点火中'
  }
})

const handleToggle = () => {
  if (props.disabled) return
  
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('toggle', newValue)
  
  if (newValue) {
    emit('ignite')
  } else {
    emit('extinguish')
  }
}
</script>

<style scoped>
@keyframes fire-flicker {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.fire-toggle-container .animate-pulse {
  animation: fire-flicker 1.5s ease-in-out infinite;
}
</style>