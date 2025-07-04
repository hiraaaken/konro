import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Button from '../../../components/ui/Button.vue'

describe('Button', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function createWrapper(props = {}) {
    return mount(Button, {
      props,
      global: {
        plugins: [createPinia()]
      }
    })
  }

  describe('Basic Rendering', () => {
    it('should_render_button_with_default_props', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.classes()).toContain('bg-gradient-to-r')
      expect(wrapper.classes()).toContain('from-orange-400')
    })

    it('should_render_button_with_slot_content', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me'
        },
        global: {
          plugins: [createPinia()]
        }
      })
      
      expect(wrapper.text()).toBe('Click me')
    })
  })

  describe('Variants', () => {
    it('should_apply_primary_variant_styles', () => {
      const wrapper = createWrapper({ variant: 'primary' })
      
      expect(wrapper.classes()).toContain('from-orange-400')
      expect(wrapper.classes()).toContain('to-red-500')
    })

    it('should_apply_secondary_variant_styles', () => {
      const wrapper = createWrapper({ variant: 'secondary' })
      
      expect(wrapper.classes()).toContain('bg-gray-200')
      expect(wrapper.classes()).toContain('text-gray-800')
    })

    it('should_apply_danger_variant_styles', () => {
      const wrapper = createWrapper({ variant: 'danger' })
      
      expect(wrapper.classes()).toContain('bg-red-500')
      expect(wrapper.classes()).toContain('text-white')
    })
  })

  describe('Sizes', () => {
    it('should_apply_small_size_styles', () => {
      const wrapper = createWrapper({ size: 'sm' })
      
      expect(wrapper.classes()).toContain('px-3')
      expect(wrapper.classes()).toContain('py-1.5')
      expect(wrapper.classes()).toContain('text-sm')
    })

    it('should_apply_large_size_styles', () => {
      const wrapper = createWrapper({ size: 'lg' })
      
      expect(wrapper.classes()).toContain('px-6')
      expect(wrapper.classes()).toContain('py-3')
      expect(wrapper.classes()).toContain('text-lg')
    })
  })

  describe('States', () => {
    it('should_handle_disabled_state', () => {
      const wrapper = createWrapper({ disabled: true })
      
      expect(wrapper.classes()).toContain('disabled:opacity-50')
      expect(wrapper.classes()).toContain('disabled:cursor-not-allowed')
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should_handle_loading_state', () => {
      const wrapper = createWrapper({ loading: true })
      
      expect(wrapper.classes()).toContain('cursor-wait')
    })

    it('should_handle_full_width', () => {
      const wrapper = createWrapper({ fullWidth: true })
      
      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('Events', () => {
    it('should_emit_click_event_when_clicked', async () => {
      const wrapper = createWrapper()
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should_not_emit_click_when_disabled', async () => {
      const wrapper = createWrapper({ disabled: true })
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should_not_emit_click_when_loading', async () => {
      const wrapper = createWrapper({ loading: true })
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
})