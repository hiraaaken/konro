import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFireLevelStore } from '../../../stores/fireLevel'
import type { FireLevel } from '../../../types/domain'

describe('useFireLevelStore', () => {
  let store: ReturnType<typeof useFireLevelStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useFireLevelStore()
  })

  describe('Initial State', () => {
    it('should_have_default_state_when_initialized', () => {
      expect(store.selectedFireLevel).toBeNull()
      expect(store.isSelected).toBe(false)
      expect(store.fireLevelOptions).toHaveLength(3)
    })

    it('should_have_correct_fire_level_options', () => {
      const options = store.fireLevelOptions
      
      expect(options[0].level).toBe('weak')
      expect(options[0].label).toBe('弱火')
      expect(options[1].level).toBe('medium')
      expect(options[1].label).toBe('中火')
      expect(options[2].level).toBe('strong')
      expect(options[2].label).toBe('強火')
    })
  })

  describe('Selection Actions', () => {
    it('should_select_fire_level_when_valid_level_provided', () => {
      store.selectFireLevel('medium')
      
      expect(store.selectedFireLevel).toBe('medium')
      expect(store.isSelected).toBe(true)
    })

    it('should_not_select_when_invalid_level_provided', () => {
      store.selectFireLevel('invalid' as FireLevel)
      
      expect(store.selectedFireLevel).toBeNull()
      expect(store.isSelected).toBe(false)
    })

    it('should_clear_selection_when_clearSelection_called', () => {
      store.selectFireLevel('strong')
      store.clearSelection()
      
      expect(store.selectedFireLevel).toBeNull()
      expect(store.isSelected).toBe(false)
    })

    it('should_initialize_with_level_when_valid', () => {
      store.initializeWithLevel('weak')
      
      expect(store.selectedFireLevel).toBe('weak')
      expect(store.isSelected).toBe(true)
    })
  })

  describe('Utility Methods', () => {
    it('should_validate_fire_level_correctly', () => {
      expect(store.isValidFireLevel('weak')).toBe(true)
      expect(store.isValidFireLevel('medium')).toBe(true)
      expect(store.isValidFireLevel('strong')).toBe(true)
      expect(store.isValidFireLevel('invalid')).toBe(false)
      expect(store.isValidFireLevel(null)).toBe(false)
      expect(store.isValidFireLevel(undefined)).toBe(false)
    })

    it('should_check_if_specific_level_is_selected', () => {
      store.selectFireLevel('medium')
      
      expect(store.isFireLevelSelected('medium')).toBe(true)
      expect(store.isFireLevelSelected('weak')).toBe(false)
      expect(store.isFireLevelSelected('strong')).toBe(false)
    })

    it('should_get_fire_level_option_by_level', () => {
      const weakOption = store.getFireLevelOption('weak')
      const invalidOption = store.getFireLevelOption('invalid' as FireLevel)
      
      expect(weakOption?.level).toBe('weak')
      expect(weakOption?.label).toBe('弱火')
      expect(invalidOption).toBeUndefined()
    })

    it('should_get_selected_option_correctly', () => {
      expect(store.getSelectedOption()).toBeNull()
      
      store.selectFireLevel('strong')
      const selectedOption = store.getSelectedOption()
      
      expect(selectedOption?.level).toBe('strong')
      expect(selectedOption?.label).toBe('強火')
    })
  })

  describe('Reactive State', () => {
    it('should_update_isSelected_when_selection_changes', () => {
      expect(store.isSelected).toBe(false)
      
      store.selectFireLevel('weak')
      expect(store.isSelected).toBe(true)
      
      store.clearSelection()
      expect(store.isSelected).toBe(false)
    })
  })
})