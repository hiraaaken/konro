import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FireOptionCard from '../../components/molecules/FireOptionCard.vue'
import type { FireLevelOption } from '../../types/domain'

const mockFireLevelOption: FireLevelOption = {
  level: 'weak',
  label: '弱火',
  description: '穏やかで優しい励まし',
  color: '#ffa500',
  intensity: '優しく寄り添うような温かいメッセージ'
}

describe('FireOptionCard', () => {
  describe('Basic Rendering', () => {
    it('should render fire option card with correct content', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      expect(wrapper.find('[data-testid="fire-option-label"]').text()).toBe('弱火')
      expect(wrapper.find('[data-testid="fire-option-description"]').text()).toBe('穏やかで優しい励まし')
      expect(wrapper.find('[data-testid="fire-option-intensity"]').text()).toBe('優しく寄り添うような温かいメッセージ')
    })

    it('should apply correct styling based on fire level', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.classes()).toContain('fire-weak')
    })

    it('should render fire icon or visual element', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      expect(wrapper.find('[data-testid="fire-icon"]').exists()).toBe(true)
    })
  })

  describe('Interaction', () => {
    it('should emit click event when card is clicked', async () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      await card.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]?.[0]).toBe('weak')
    })

    it('should show hover effect', async () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      await card.trigger('mouseenter')
      
      expect(card.classes()).toContain('hovered')
    })

    it('should support keyboard interaction', async () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      await card.trigger('keydown.enter')
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('Selected State', () => {
    it('should show selected state when selected prop is true', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption,
          selected: true
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.classes()).toContain('selected')
      expect(card.attributes('aria-selected')).toBe('true')
    })

    it('should not show selected state when selected prop is false', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption,
          selected: false
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.classes()).not.toContain('selected')
      expect(card.attributes('aria-selected')).toBe('false')
    })
  })

  describe('Disabled State', () => {
    it('should handle disabled state', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption,
          disabled: true
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.classes()).toContain('disabled')
      expect(card.attributes('disabled')).toBeDefined()
      expect(card.attributes('tabindex')).toBe('-1')
    })

    it('should not emit click when disabled', async () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption,
          disabled: true
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      await card.trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.attributes('role')).toBe('radio')
      expect(card.attributes('tabindex')).toBe('0')
      expect(card.attributes('aria-label')).toContain('弱火')
    })

    it('should support screen reader descriptions', () => {
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mockFireLevelOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.attributes('aria-describedby')).toBeDefined()
      
      const description = wrapper.find(`#${card.attributes('aria-describedby')}`)
      expect(description.exists()).toBe(true)
    })
  })

  describe('Fire Level Variants', () => {
    it('should render medium fire level correctly', () => {
      const mediumOption: FireLevelOption = {
        level: 'medium',
        label: '中火',
        description: '元気で明るい励まし',
        color: '#ff6b35',
        intensity: 'バランスの取れた励ましメッセージ'
      }
      
      const wrapper = mount(FireOptionCard, {
        props: {
          option: mediumOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.classes()).toContain('fire-medium')
      expect(wrapper.find('[data-testid="fire-option-label"]').text()).toBe('中火')
    })

    it('should render strong fire level correctly', () => {
      const strongOption: FireLevelOption = {
        level: 'strong',
        label: '強火',
        description: '熱血で情熱的な励まし',
        color: '#ff4757',
        intensity: '強烈で力強い励ましメッセージ'
      }
      
      const wrapper = mount(FireOptionCard, {
        props: {
          option: strongOption
        }
      })
      
      const card = wrapper.find('[role="radio"]')
      expect(card.classes()).toContain('fire-strong')
      expect(wrapper.find('[data-testid="fire-option-label"]').text()).toBe('強火')
    })
  })
})