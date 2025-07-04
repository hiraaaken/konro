import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Icon from '../../../components/ui/Icon.vue'

describe('Icon', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function createWrapper(props = {}) {
    return mount(Icon, {
      props,
      global: {
        plugins: [createPinia()]
      }
    })
  }

  describe('Basic Rendering', () => {
    it('should_render_fire_icon', () => {
      const wrapper = createWrapper({ name: 'fire' })
      
      expect(wrapper.text()).toBe('🔥')
      expect(wrapper.classes()).toContain('inline-block')
    })

    it('should_render_check_icon', () => {
      const wrapper = createWrapper({ name: 'check' })
      
      expect(wrapper.text()).toBe('✓')
    })

    it('should_render_custom_text_for_unknown_icon', () => {
      const wrapper = createWrapper({ name: 'custom' })
      
      expect(wrapper.text()).toBe('custom')
    })
  })

  describe('Sizes', () => {
    it('should_apply_small_size', () => {
      const wrapper = createWrapper({ name: 'fire', size: 'sm' })
      
      expect(wrapper.classes()).toContain('text-sm')
    })

    it('should_apply_large_size', () => {
      const wrapper = createWrapper({ name: 'fire', size: 'lg' })
      
      expect(wrapper.classes()).toContain('text-lg')
    })

    it('should_apply_extra_large_size', () => {
      const wrapper = createWrapper({ name: 'fire', size: 'xl' })
      
      expect(wrapper.classes()).toContain('text-xl')
    })
  })

  describe('Colors', () => {
    it('should_apply_primary_color', () => {
      const wrapper = createWrapper({ name: 'fire', color: 'primary' })
      
      expect(wrapper.classes()).toContain('text-orange-500')
    })

    it('should_apply_danger_color', () => {
      const wrapper = createWrapper({ name: 'fire', color: 'danger' })
      
      expect(wrapper.classes()).toContain('text-red-500')
    })

    it('should_apply_success_color', () => {
      const wrapper = createWrapper({ name: 'check', color: 'success' })
      
      expect(wrapper.classes()).toContain('text-green-500')
    })
  })

  describe('Animations', () => {
    it('should_apply_pulse_animation_for_fire_icon', () => {
      const wrapper = createWrapper({ name: 'fire', animated: true })
      
      expect(wrapper.classes()).toContain('animate-pulse')
    })

    it('should_apply_spin_animation_for_loading_icon', () => {
      const wrapper = createWrapper({ name: 'loading', animated: true })
      
      expect(wrapper.classes()).toContain('animate-spin')
    })

    it('should_apply_bounce_animation_for_arrow_icon', () => {
      const wrapper = createWrapper({ name: 'arrow-right', animated: true })
      
      expect(wrapper.classes()).toContain('animate-bounce')
    })

    it('should_not_apply_animation_when_not_animated', () => {
      const wrapper = createWrapper({ name: 'fire', animated: false })
      
      expect(wrapper.classes()).not.toContain('animate-pulse')
    })
  })

  describe('Accessibility', () => {
    it('should_have_default_role', () => {
      const wrapper = createWrapper({ name: 'fire' })
      
      expect(wrapper.attributes('role')).toBe('img')
    })

    it('should_accept_custom_role', () => {
      const wrapper = createWrapper({ name: 'fire', role: 'button' })
      
      expect(wrapper.attributes('role')).toBe('button')
    })

    it('should_accept_aria_label', () => {
      const wrapper = createWrapper({ name: 'fire', ariaLabel: 'Fire icon' })
      
      expect(wrapper.attributes('aria-label')).toBe('Fire icon')
    })
  })
})