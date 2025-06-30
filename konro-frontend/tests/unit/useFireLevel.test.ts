import { describe, it, expect, beforeEach } from 'vitest'
import { useFireLevel } from '../../composables/useFireLevel'
import type { FireLevel } from '../../types/domain'

describe('useFireLevel', () => {
  describe('Fire Level Options', () => {
    it('should provide all fire level options', () => {
      const { fireLevelOptions } = useFireLevel()
      
      expect(fireLevelOptions.value).toHaveLength(3)
      
      const levels = fireLevelOptions.value.map(option => option.level)
      expect(levels).toContain('weak')
      expect(levels).toContain('medium')
      expect(levels).toContain('strong')
    })

    it('should have correct fire level configurations', () => {
      const { fireLevelOptions } = useFireLevel()
      
      const weakOption = fireLevelOptions.value.find(option => option.level === 'weak')
      const mediumOption = fireLevelOptions.value.find(option => option.level === 'medium')
      const strongOption = fireLevelOptions.value.find(option => option.level === 'strong')
      
      expect(weakOption).toEqual({
        level: 'weak',
        label: '弱火',
        description: '穏やかで優しい励まし',
        color: '#ffa500',
        intensity: '優しく寄り添うような温かいメッセージでサポートします'
      })
      
      expect(mediumOption).toEqual({
        level: 'medium',
        label: '中火',
        description: '元気で明るい励まし',
        color: '#ff6b35',
        intensity: 'バランスの取れた励ましとアドバイスを提供します'
      })
      
      expect(strongOption).toEqual({
        level: 'strong',
        label: '強火',
        description: '熱血で情熱的な励まし',
        color: '#ff4757',
        intensity: '強烈で力強い励ましで背中を押します'
      })
    })
  })

  describe('Selection Management', () => {
    it('should initialize with no selection', () => {
      const { selectedFireLevel, isSelected } = useFireLevel()
      
      expect(selectedFireLevel.value).toBe(null)
      expect(isSelected.value).toBe(false)
    })

    it('should select fire level correctly', () => {
      const { selectFireLevel, selectedFireLevel, isSelected } = useFireLevel()
      
      selectFireLevel('medium')
      
      expect(selectedFireLevel.value).toBe('medium')
      expect(isSelected.value).toBe(true)
    })

    it('should change selection when different level is selected', () => {
      const { selectFireLevel, selectedFireLevel } = useFireLevel()
      
      selectFireLevel('weak')
      expect(selectedFireLevel.value).toBe('weak')
      
      selectFireLevel('strong')
      expect(selectedFireLevel.value).toBe('strong')
    })

    it('should clear selection', () => {
      const { selectFireLevel, clearSelection, selectedFireLevel, isSelected } = useFireLevel()
      
      selectFireLevel('medium')
      expect(isSelected.value).toBe(true)
      
      clearSelection()
      expect(selectedFireLevel.value).toBe(null)
      expect(isSelected.value).toBe(false)
    })
  })

  describe('Fire Level Utilities', () => {
    it('should get fire level option by level', () => {
      const { getFireLevelOption } = useFireLevel()
      
      const weakOption = getFireLevelOption('weak')
      expect(weakOption?.level).toBe('weak')
      expect(weakOption?.label).toBe('弱火')
      
      const invalidOption = getFireLevelOption('invalid' as FireLevel)
      expect(invalidOption).toBeUndefined()
    })

    it('should check if fire level is selected', () => {
      const { selectFireLevel, isFireLevelSelected } = useFireLevel()
      
      expect(isFireLevelSelected('weak')).toBe(false)
      
      selectFireLevel('weak')
      expect(isFireLevelSelected('weak')).toBe(true)
      expect(isFireLevelSelected('medium')).toBe(false)
    })

    it('should get selected fire level option', () => {
      const { selectFireLevel, getSelectedOption } = useFireLevel()
      
      expect(getSelectedOption()).toBe(null)
      
      selectFireLevel('strong')
      const selectedOption = getSelectedOption()
      expect(selectedOption?.level).toBe('strong')
      expect(selectedOption?.label).toBe('強火')
    })
  })

  describe('Validation', () => {
    it('should validate fire level values', () => {
      const { isValidFireLevel } = useFireLevel()
      
      expect(isValidFireLevel('weak')).toBe(true)
      expect(isValidFireLevel('medium')).toBe(true)
      expect(isValidFireLevel('strong')).toBe(true)
      expect(isValidFireLevel('invalid' as FireLevel)).toBe(false)
      expect(isValidFireLevel(null)).toBe(false)
      expect(isValidFireLevel(undefined)).toBe(false)
    })

    it('should not select invalid fire level', () => {
      const { selectFireLevel, selectedFireLevel } = useFireLevel()
      
      selectFireLevel('invalid' as FireLevel)
      expect(selectedFireLevel.value).toBe(null)
    })
  })

  describe('Initial Selection', () => {
    it('should accept initial fire level', () => {
      const { selectedFireLevel, isSelected } = useFireLevel('medium')
      
      expect(selectedFireLevel.value).toBe('medium')
      expect(isSelected.value).toBe(true)
    })

    it('should ignore invalid initial fire level', () => {
      const { selectedFireLevel, isSelected } = useFireLevel('invalid' as FireLevel)
      
      expect(selectedFireLevel.value).toBe(null)
      expect(isSelected.value).toBe(false)
    })
  })

  describe('Reactivity', () => {
    it('should be reactive to selection changes', () => {
      const { selectFireLevel, selectedFireLevel } = useFireLevel()
      
      // Test that the ref updates synchronously
      expect(selectedFireLevel.value).toBe(null)
      
      selectFireLevel('weak')
      expect(selectedFireLevel.value).toBe('weak')
      
      selectFireLevel('medium')
      expect(selectedFireLevel.value).toBe('medium')
      
      selectFireLevel('strong')
      expect(selectedFireLevel.value).toBe('strong')
    })
  })
})