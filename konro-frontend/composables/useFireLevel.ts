import type { FireLevel } from '../types/domain'
import { useFireLevelStore } from '../stores/fireLevel'

/**
 * Composable for Fire Level management using Pinia store
 * This is a compatibility layer for components that still use the composable pattern
 * New components should use the Pinia store directly
 * 
 * @param initialSelection - Optional initial fire level selection
 * @deprecated Use useFireLevelStore() directly from Pinia stores instead
 */
export function useFireLevel(initialSelection?: FireLevel | null) {
  const store = useFireLevelStore()
  
  // Initialize with provided selection if valid
  if (initialSelection && store.isValidFireLevel(initialSelection)) {
    store.initializeWithLevel(initialSelection)
  }

  return {
    // State (reactive references from store - these are refs, so they need .value access)
    fireLevelOptions: store.fireLevelOptions,
    selectedFireLevel: store.selectedFireLevel,
    isSelected: store.isSelected,
    
    // Actions (direct store methods)
    selectFireLevel: store.selectFireLevel,
    clearSelection: store.clearSelection,
    
    // Utilities (direct store methods)
    getFireLevelOption: store.getFireLevelOption,
    isFireLevelSelected: store.isFireLevelSelected,
    getSelectedOption: store.getSelectedOption,
    isValidFireLevel: store.isValidFireLevel
  }
}