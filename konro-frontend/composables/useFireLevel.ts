import { ref, computed } from 'vue'
import type { FireLevel, FireLevelOption } from '../types/domain'

export function useFireLevel(initialSelection?: FireLevel | null) {
  // Fire level configuration
  const fireLevelOptions = ref<FireLevelOption[]>([
    {
      level: 'weak',
      label: '弱火',
      description: '穏やかで優しい励まし',
      color: '#ffa500',
      intensity: '優しく寄り添うような温かいメッセージでサポートします'
    },
    {
      level: 'medium',
      label: '中火',
      description: '元気で明るい励まし',
      color: '#ff6b35',
      intensity: 'バランスの取れた励ましとアドバイスを提供します'
    },
    {
      level: 'strong',
      label: '強火',
      description: '熱血で情熱的な励まし',
      color: '#ff4757',
      intensity: '強烈で力強い励ましで背中を押します'
    }
  ])

  // Selection state
  const selectedFireLevel = ref<FireLevel | null>(
    isValidFireLevel(initialSelection) ? initialSelection : null
  )

  // Computed properties
  const isSelected = computed(() => selectedFireLevel.value !== null)

  // Utility functions
  function isValidFireLevel(level: any): level is FireLevel {
    if (!level) return false
    return ['weak', 'medium', 'strong'].includes(level)
  }

  function selectFireLevel(level: FireLevel) {
    if (isValidFireLevel(level)) {
      selectedFireLevel.value = level
    }
  }

  function clearSelection() {
    selectedFireLevel.value = null
  }

  function getFireLevelOption(level: FireLevel): FireLevelOption | undefined {
    return fireLevelOptions.value.find(option => option.level === level)
  }

  function isFireLevelSelected(level: FireLevel): boolean {
    return selectedFireLevel.value === level
  }

  function getSelectedOption(): FireLevelOption | null {
    if (!selectedFireLevel.value) return null
    return getFireLevelOption(selectedFireLevel.value) || null
  }

  return {
    // State
    fireLevelOptions,
    selectedFireLevel,
    isSelected,
    
    // Actions
    selectFireLevel,
    clearSelection,
    
    // Utilities
    getFireLevelOption,
    isFireLevelSelected,
    getSelectedOption,
    isValidFireLevel
  }
}