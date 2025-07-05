import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FireLevelSelector from '../../../components/fire-level/FireLevelSelector.vue'
import type { FireLevel } from '../../../types/domain'

describe('FireLevelSelector', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function createWrapper(props = {}) {
    return mount(FireLevelSelector, {
      props,
      global: {
        plugins: [pinia]
      }
    })
  }

  describe('Basic Rendering', () => {
    it('should render fire level selector with three options', () => {
      const wrapper = createWrapper()
      
      // Check if all three fire level options are rendered
      const fireOptions = wrapper.findAll('[role="radio"]')
      expect(fireOptions).toHaveLength(3)
      
      // Check if weak, medium, strong options are present
      expect(wrapper.find('[data-testid*="fire-option-weak"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid*="fire-option-medium"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid*="fire-option-strong"]').exists()).toBe(true)
    })

    it('should display correct labels for each fire level', () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      const mediumOption = wrapper.find('[data-testid*="fire-option-medium"]')
      const strongOption = wrapper.find('[data-testid*="fire-option-strong"]')
      
      expect(weakOption.text()).toContain('弱火')
      expect(mediumOption.text()).toContain('中火')
      expect(strongOption.text()).toContain('強火')
    })

    it('should display descriptions for each fire level', () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      const mediumOption = wrapper.find('[data-testid*="fire-option-medium"]')
      const strongOption = wrapper.find('[data-testid*="fire-option-strong"]')
      
      expect(weakOption.text()).toContain('穏やかで優しい励まし')
      expect(mediumOption.text()).toContain('元気で明るい励まし')
      expect(strongOption.text()).toContain('熱血で情熱的な励まし')
    })
  })

  describe('Selection Behavior', () => {
    it('should select fire level when option is clicked', async () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      await weakOption.trigger('click')
      
      expect(weakOption.classes()).toContain('selected')
      expect(wrapper.emitted('fire-level-selected')).toBeTruthy()
      expect(wrapper.emitted('fire-level-selected')?.[0]?.[0]).toBe('weak')
    })

    it('should only allow single selection', async () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      const mediumOption = wrapper.find('[data-testid*="fire-option-medium"]')
      
      await weakOption.trigger('click')
      await mediumOption.trigger('click')
      
      expect(weakOption.classes()).not.toContain('selected')
      expect(mediumOption.classes()).toContain('selected')
    })

    it('should emit selection event with correct fire level', async () => {
      const wrapper = createWrapper()
      
      const strongOption = wrapper.find('[data-testid*="fire-option-strong"]')
      await strongOption.trigger('click')
      
      const emittedEvents = wrapper.emitted('fire-level-selected')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents?.[0]?.[0]).toBe('strong')
    })
  })

  describe('Visual Feedback', () => {
    it('should apply correct color theme for each fire level', () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      const mediumOption = wrapper.find('[data-testid*="fire-option-medium"]')
      const strongOption = wrapper.find('[data-testid*="fire-option-strong"]')
      
      // Check if color classes are applied based on fire level
      expect(weakOption.classes()).toContain('fire-weak')
      expect(mediumOption.classes()).toContain('fire-medium')
      expect(strongOption.classes()).toContain('fire-strong')
    })

    it('should show hover effects on fire options', async () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      await weakOption.trigger('mouseenter')
      
      expect(weakOption.classes()).toContain('hovered')
    })

    it('should show selected state visually', async () => {
      const wrapper = createWrapper()
      
      const mediumOption = wrapper.find('[data-testid*="fire-option-medium"]')
      await mediumOption.trigger('click')
      
      expect(mediumOption.classes()).toContain('selected')
      expect(mediumOption.attributes('aria-selected')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = createWrapper()
      
      const selector = wrapper.find('[data-testid="fire-level-selector"]')
      expect(selector.attributes('role')).toBe('radiogroup')
      expect(selector.attributes('aria-label')).toBe('火力レベル選択')
      
      const options = wrapper.findAll('[role="radio"]')
      options.forEach(option => {
        expect(option.attributes('role')).toBe('radio')
        expect(option.attributes('tabindex')).toBeDefined()
      })
    })

    it('should support keyboard navigation', async () => {
      const wrapper = createWrapper()
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      await weakOption.trigger('keydown.enter')
      
      expect(wrapper.emitted('fire-level-selected')).toBeTruthy()
      expect(wrapper.emitted('fire-level-selected')?.[0]?.[0]).toBe('weak')
    })

    it('should support space key selection', async () => {
      const wrapper = createWrapper()
      
      const strongOption = wrapper.find('[data-testid*="fire-option-strong"]')
      await strongOption.trigger('keydown.space')
      
      expect(wrapper.emitted('fire-level-selected')).toBeTruthy()
      expect(wrapper.emitted('fire-level-selected')?.[0]?.[0]).toBe('strong')
    })
  })

  describe('Props and State Management', () => {
    it('should accept initial selected fire level via props', () => {
      const wrapper = createWrapper({
        initialSelected: 'medium' as FireLevel
      })
      
      const mediumOption = wrapper.find('[data-testid*="fire-option-medium"]')
      expect(mediumOption.classes()).toContain('selected')
    })

    it('should handle disabled state', () => {
      const wrapper = createWrapper({
        disabled: true
      })
      
      const options = wrapper.findAll('[role="radio"]')
      options.forEach(option => {
        expect(option.attributes('disabled')).toBeDefined()
        expect(option.classes()).toContain('disabled')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid initial selection gracefully', () => {
      const wrapper = createWrapper({
        initialSelected: 'invalid' as FireLevel
      })
      
      // Should not have any selected option for invalid input
      const selectedOptions = wrapper.findAll('.selected')
      expect(selectedOptions).toHaveLength(0)
    })

    it('should prevent selection when disabled', async () => {
      const wrapper = createWrapper({
        disabled: true
      })
      
      const weakOption = wrapper.find('[data-testid*="fire-option-weak"]')
      await weakOption.trigger('click')
      
      expect(wrapper.emitted('fire-level-selected')).toBeFalsy()
    })
  })
})