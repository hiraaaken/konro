import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserInfoForm from '../../../components/user/UserInfoForm.vue'
import { useUserInfoStore } from '../../../stores/userInfo'

// Mock components
vi.mock('../../../components/ui/FormField.vue', () => ({
  default: {
    name: 'FormField',
    template: '<div class="form-field"><label>{{ label }}</label><slot name="input"></slot></div>',
    props: ['label', 'required', 'helpText']
  }
}))

vi.mock('../../../components/ui/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot></slot></button>',
    props: ['variant', 'fullWidth', 'loading', 'disabled'],
    emits: ['click']
  }
}))

vi.mock('../../../components/ui/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="icon"></span>',
    props: ['name', 'size', 'color']
  }
}))

vi.mock('../../../components/ui/Badge.vue', () => ({
  default: {
    name: 'Badge',
    template: '<span class="badge"><slot></slot></span>',
    props: ['variant', 'icon']
  }
}))

describe('UserInfoForm', () => {
  let wrapper: VueWrapper
  let userInfoStore: ReturnType<typeof useUserInfoStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    userInfoStore = useUserInfoStore()
    
    wrapper = mount(UserInfoForm, {
      props: {
        loading: false
      }
    })
  })

  describe('Rendering', () => {
    it('should render the form correctly', () => {
      expect(wrapper.find('[data-testid="user-info-form"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('プロフィール設定')
      expect(wrapper.text()).toContain('より良い励ましを提供するために、簡単な情報を教えてください')
    })

    it('should render all form fields', () => {
      const formFields = wrapper.findAllComponents({ name: 'FormField' })
      expect(formFields).toHaveLength(3)
      
      // Check field labels
      expect(wrapper.text()).toContain('年代')
      expect(wrapper.text()).toContain('性別')
      expect(wrapper.text()).toContain('職業')
    })

    it('should render age options from store', () => {
      const ageSelect = wrapper.find('select').element as HTMLSelectElement
      const options = Array.from(ageSelect.options).map(opt => opt.text)
      
      expect(options).toContain('選択してください')
      expect(options).toContain('10代')
      expect(options).toContain('20代')
      expect(options).toContain('30代')
    })

    it('should render action buttons', () => {
      const buttons = wrapper.findAllComponents({ name: 'Button' })
      expect(buttons).toHaveLength(2)
      
      expect(wrapper.text()).toContain('保存')
      expect(wrapper.text()).toContain('後で設定')
    })
  })

  describe('Form Interaction', () => {
    it('should update form data when user selects options', async () => {
      const ageSelect = wrapper.find('select')
      await ageSelect.setValue('twenties')
      
      expect((ageSelect.element as HTMLSelectElement).value).toBe('twenties')
    })

    it('should emit submit event with user data when form is submitted', async () => {
      // Fill out the form
      const selects = wrapper.findAll('select')
      await selects[0].setValue('twenties')  // age
      await selects[1].setValue('male')  // gender  
      await selects[2].setValue('student')  // occupation

      // Find and click submit button
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Check if submit event was emitted with correct data
      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents![0][0]).toEqual({
        age: 'twenties',
        gender: 'male',
        occupation: 'student'
      })
    })

    it('should emit skip event when skip button is clicked', async () => {
      const buttons = wrapper.findAllComponents({ name: 'Button' })
      const skipButton = buttons[1] // Second button is skip
      
      await skipButton.trigger('click')

      expect(wrapper.emitted('skip')).toBeTruthy()
    })

    it('should call store methods when form is submitted', async () => {
      const setUserInfoSpy = vi.spyOn(userInfoStore, 'setUserInfo')
      
      const selects = wrapper.findAll('select')
      await selects[0].setValue('thirties')
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(setUserInfoSpy).toHaveBeenCalledWith({
        age: 'thirties',
        gender: undefined,
        occupation: undefined
      })
    })

    it('should call store skip method when skip is clicked', async () => {
      const skipUserInfoSpy = vi.spyOn(userInfoStore, 'skipUserInfo')
      
      const buttons = wrapper.findAllComponents({ name: 'Button' })
      const skipButton = buttons[1]
      
      await skipButton.trigger('click')

      expect(skipUserInfoSpy).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should show loading state on submit button when loading prop is true', async () => {
      await wrapper.setProps({ loading: true })
      
      const buttons = wrapper.findAllComponents({ name: 'Button' })
      const submitButton = buttons[0]
      
      expect(submitButton.props('loading')).toBe(true)
    })

    it('should disable skip button when loading', async () => {
      await wrapper.setProps({ loading: true })
      
      const buttons = wrapper.findAllComponents({ name: 'Button' })
      const skipButton = buttons[1]
      
      expect(skipButton.props('disabled')).toBe(true)
    })
  })

  describe('Form State Indicators', () => {
    it('should show progress badge when user has info', async () => {
      // Mock store state
      userInfoStore.setUserInfo({ age: 'twenties', gender: 'male' })
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('設定済み')
    })

    it('should pre-populate form with existing user info', async () => {
      // Set user info in store before mounting component
      userInfoStore.setUserInfo({ age: 'twenties', gender: 'male', occupation: 'student' })
      
      wrapper = mount(UserInfoForm, {
        props: { loading: false }
      })

      const selects = wrapper.findAll('select')
      expect((selects[0].element as HTMLSelectElement).value).toBe('twenties')
      expect((selects[1].element as HTMLSelectElement).value).toBe('male')
      expect((selects[2].element as HTMLSelectElement).value).toBe('student')
    })
  })

  describe('Accessibility', () => {
    it('should have proper test id', () => {
      expect(wrapper.find('[data-testid="user-info-form"]').exists()).toBe(true)
    })

    it('should have form element for keyboard navigation', () => {
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('should have select elements with proper structure', () => {
      const selects = wrapper.findAll('select')
      expect(selects).toHaveLength(3)
      
      selects.forEach(select => {
        expect(select.find('option[value=""]').text()).toBe('選択してください')
      })
    })
  })
})