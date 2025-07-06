<template>
  <div
    :data-testid="'fire-level-selector'"
    class="fire-level-selector"
    role="radiogroup"
    aria-label="火力レベル選択"
  >
    <!-- Title -->
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        励ましの火力を選んでください
      </h2>
      <p class="text-gray-600">
        あなたに合った励ましのスタイルを選択してください
      </p>
    </div>

    <!-- Fire Level Options -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
      <FireOptionCard
        v-for="option in fireLevelOptions"
        :key="option.level"
        :data-testid="`fire-option-${option.level}`"
        :option="option"
        :selected="fireLevelStore.isFireLevelSelected(option.level)"
        :disabled="disabled"
        class="fire-option"
        @click="handleFireLevelSelect"
      />
    </div>

    <!-- Continue Button (only show if selection is made) -->
    <div
      v-if="isSelected && !disabled"
      class="mt-8 text-center"
    >
      <Button
        size="lg"
        variant="primary"
        @click="handleContinue"
      >
        チャットを始める
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFireLevelStore } from '../../stores/fireLevel'
import FireOptionCard from './FireOptionCard.vue'
import Button from '../ui/Button.vue'
import type { FireLevel } from '../../types/domain'

interface Props {
  initialSelected?: FireLevel | null
  disabled?: boolean
}

interface Emits {
  (e: 'fire-level-selected', level: FireLevel): void
  (e: 'continue', level: FireLevel): void
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: null,
  disabled: false
})

const emit = defineEmits<Emits>()

// Use Pinia store
const fireLevelStore = useFireLevelStore()

// Initialize with props value
if (props.initialSelected) {
  fireLevelStore.initializeWithLevel(props.initialSelected)
}

// Reactive references from store
const {
  fireLevelOptions,
  selectedFireLevel,
  isSelected
} = storeToRefs(fireLevelStore)

// Event handlers
function handleFireLevelSelect(level: FireLevel) {
  if (!props.disabled) {
    fireLevelStore.selectFireLevel(level)
    emit('fire-level-selected', level)
  }
}

function handleContinue() {
  if (selectedFireLevel.value && !props.disabled) {
    emit('continue', selectedFireLevel.value)
  }
}
</script>

<style scoped>
.fire-level-selector {
  padding: 1.5rem;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .fire-level-selector {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .fire-level-selector {
    padding: 3rem;
  }
}
</style>