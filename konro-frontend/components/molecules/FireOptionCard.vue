<template>
  <div
    v-bind="$attrs"
    :data-testid="`fire-option fire-option-${option.level}`"
    :class="[cardClasses, 'fire-option']"
    :role="'radio'"
    :aria-selected="selected"
    :aria-label="`${option.label} - ${option.description}`"
    :aria-describedby="`fire-option-description-${option.level}`"
    :tabindex="disabled ? -1 : 0"
    :disabled="disabled || undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Fire Icon -->
    <div 
      :data-testid="'fire-icon'"
      :class="iconClasses"
    >
      🔥
    </div>

    <!-- Content -->
    <div class="flex-1">
      <!-- Label -->
      <h3 
        :data-testid="'fire-option-label'"
        class="text-lg font-bold mb-2"
      >
        {{ option.label }}
      </h3>

      <!-- Description -->
      <p 
        :data-testid="'fire-option-description'"
        class="text-sm text-gray-600 mb-2"
      >
        {{ option.description }}
      </p>

      <!-- Intensity -->
      <p 
        :data-testid="'fire-option-intensity'"
        :id="`fire-option-description-${option.level}`"
        class="text-xs text-gray-500"
      >
        {{ option.intensity }}
      </p>
    </div>

    <!-- Selection Indicator -->
    <div
      v-if="selected"
      class="ml-2 text-white"
      aria-hidden="true"
    >
      ✓
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FireLevel, FireLevelOption } from '../../types/domain'

defineOptions({
  inheritAttrs: false
})

interface Props {
  option: FireLevelOption
  selected?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'click', level: FireLevel): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  disabled: false
})

const emit = defineEmits<Emits>()

// State
const isHovered = ref(false)

// Computed classes
const cardClasses = computed(() => [
  'flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
  'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  // Fire level specific styling
  `fire-${props.option.level}`,
  
  // State classes
  {
    'selected': props.selected,
    'hovered': isHovered.value,
    'disabled': props.disabled,
    'opacity-50 cursor-not-allowed': props.disabled,
    'border-gray-300 bg-white': !props.selected && !props.disabled,
    'transform scale-105': props.selected && !props.disabled,
  },
  
  // Fire level specific colors
  {
    'border-yellow-400 bg-yellow-50': props.option.level === 'weak' && !props.selected,
    'border-orange-400 bg-orange-50': props.option.level === 'medium' && !props.selected,
    'border-red-400 bg-red-50': props.option.level === 'strong' && !props.selected,
    
    'border-yellow-500 bg-yellow-200': props.option.level === 'weak' && props.selected,
    'border-orange-500 bg-orange-200': props.option.level === 'medium' && props.selected,
    'border-red-500 bg-red-200': props.option.level === 'strong' && props.selected,
  }
])

const iconClasses = computed(() => [
  'text-2xl mr-3 transition-transform duration-200',
  {
    'animate-pulse': props.selected,
    'transform scale-110': isHovered.value && !props.disabled,
  }
])

// Event handlers
function handleClick() {
  if (!props.disabled) {
    emit('click', props.option.level)
  }
}

function handleMouseEnter() {
  if (!props.disabled) {
    isHovered.value = true
  }
}

function handleMouseLeave() {
  isHovered.value = false
}
</script>

<style scoped>
.fire-weak {
  --fire-color: #ffa500;
}

.fire-medium {
  --fire-color: #ff6b35;
}

.fire-strong {
  --fire-color: #ff4757;
}

.fire-weak:focus {
  --tw-ring-color: rgb(245 158 11 / var(--tw-ring-opacity));
}

.fire-medium:focus {
  --tw-ring-color: rgb(249 115 22 / var(--tw-ring-opacity));
}

.fire-strong:focus {
  --tw-ring-color: rgb(239 68 68 / var(--tw-ring-opacity));
}
</style>