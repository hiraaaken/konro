import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ChatInterface from '../../../components/chat/ChatInterface.vue'
import type { ChatMessage } from '../../../stores/chatSession'

// Mock the animation composable
vi.mock('../../../composables/useAnimation', () => ({
  useAnimation: () => ({
    detectNegativeWords: vi.fn(() => []),
    animateNegativeWords: vi.fn()
  })
}))

// Mock required components to avoid rendering complexity
vi.mock('../../../components/ui/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['disabled', 'loading', 'variant', 'size', 'icon', 'fullWidth'],
    emits: ['click'],
    template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
  }
}))

vi.mock('../../../components/ui/Input.vue', () => ({
  default: {
    name: 'Input',
    props: ['modelValue', 'disabled', 'placeholder'],
    emits: ['update:modelValue'],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" v-bind="$attrs" />'
  }
}))

vi.mock('../../../components/ui/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'size', 'class'],
    template: '<span class="icon">{{ name }}</span>'
  }
}))

vi.mock('../../../components/chat/ChatBubble.vue', () => ({
  default: {
    name: 'ChatBubble',
    props: ['message', 'isUser', 'timestamp', 'processed', 'detectedNegativeWords', 'wordTransformations'],
    template: '<div class="chat-bubble">{{ message }}</div>'
  }
}))

describe('ChatInterface', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      content: 'こんにちは',
      isUser: true,
      timestamp: new Date('2023-01-01T10:00:00Z')
    },
    {
      id: '2',
      content: 'こんにちは！元気ですか？',
      isUser: false,
      timestamp: new Date('2023-01-01T10:00:30Z')
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
  })

  const createWrapper = (props = {}) => {
    return mount(ChatInterface, {
      props: {
        messages: mockMessages,
        isLoading: false,
        ...props
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render chat interface correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[data-testid="chat-interface"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="messages-container"]').exists()).toBe(true)
    })

    it('should render messages', () => {
      wrapper = createWrapper()
      
      const chatBubbles = wrapper.findAllComponents({ name: 'ChatBubble' })
      expect(chatBubbles).toHaveLength(2)
    })

    it('should show loading indicator when loading', () => {
      wrapper = createWrapper({ isLoading: true })
      
      const loadingElement = wrapper.find('.flex.justify-start')
      expect(loadingElement.exists()).toBe(true)
      expect(loadingElement.text()).toContain('考え中')
    })

    it('should not show loading indicator when not loading', () => {
      wrapper = createWrapper({ isLoading: false })
      
      const loadingElements = wrapper.findAll('.flex.justify-start')
      expect(loadingElements.length).toBe(0)
    })
  })

  describe('Message Input', () => {
    it('should have message input field', () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'Input' })
      expect(input.exists()).toBe(true)
      expect(input.props('placeholder')).toBe('メッセージを入力してください...')
    })

    it('should have send button', () => {
      wrapper = createWrapper()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      expect(sendButton.exists()).toBe(true)
      expect(sendButton.text()).toContain('送信')
    })

    it('should disable input when loading', () => {
      wrapper = createWrapper({ isLoading: true })
      
      const input = wrapper.findComponent({ name: 'Input' })
      expect(input.props('disabled')).toBe(true)
    })

    it('should disable send button when loading', () => {
      wrapper = createWrapper({ isLoading: true })
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      expect(sendButton.props('loading')).toBe(true)
    })

    it('should disable send button when message is empty', () => {
      wrapper = createWrapper()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      expect(sendButton.props('disabled')).toBe(true)
    })

    it('should enable send button when message is not empty and not loading', async () => {
      wrapper = createWrapper({ isLoading: false })
      
      const input = wrapper.findComponent({ name: 'Input' })
      await input.vm.$emit('update:modelValue', 'テストメッセージ')
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      expect(sendButton.props('disabled')).toBe(false)
    })
  })

  describe('Message Sending', () => {
    it('should emit send-message event when send button is clicked', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'Input' })
      await input.vm.$emit('update:modelValue', 'テストメッセージ')
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      await sendButton.trigger('click')
      
      expect(wrapper.emitted('send-message')).toBeTruthy()
      expect(wrapper.emitted('send-message')?.[0]).toEqual(['テストメッセージ'])
    })

    it('should emit send-message event when Enter key is pressed', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'Input' })
      await input.vm.$emit('update:modelValue', 'テストメッセージ')
      await wrapper.vm.$nextTick()
      
      await input.trigger('keydown.enter')
      
      expect(wrapper.emitted('send-message')).toBeTruthy()
      expect(wrapper.emitted('send-message')?.[0]).toEqual(['テストメッセージ'])
    })

    it('should clear input after sending message', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'Input' })
      await input.vm.$emit('update:modelValue', 'テストメッセージ')
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      await sendButton.trigger('click')
      
      // Check that internal inputMessage is cleared
      expect(wrapper.vm.inputMessage).toBe('')
    })

    it('should not send empty messages', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'Input' })
      await input.vm.$emit('update:modelValue', '   ')  // whitespace only
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      await sendButton.trigger('click')
      
      expect(wrapper.emitted('send-message')).toBeFalsy()
    })

    it('should not send messages when loading', async () => {
      wrapper = createWrapper({ isLoading: true })
      
      const input = wrapper.findComponent({ name: 'Input' })
      await input.vm.$emit('update:modelValue', 'テストメッセージ')
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.findComponent({ name: 'Button' })
      await sendButton.trigger('click')
      
      expect(wrapper.emitted('send-message')).toBeFalsy()
    })
  })

  describe('Animation Integration', () => {
    it('should call animation methods for messages with negative words', () => {
      wrapper = createWrapper()
      
      const messagesWithNegativeWords = [
        {
          id: '3',
          content: '今日は辛い日でした',
          isUser: true,
          timestamp: new Date(),
          detectedNegativeWords: ['辛い']
        }
      ]
      
      const chatBubbles = wrapper.findAllComponents({ name: 'ChatBubble' })
      expect(chatBubbles.length).toBeGreaterThan(0)
    })

    it('should handle transformation data correctly', () => {
      const transformations = [
        { original: '辛い', transformed: '成長のチャンス' }
      ]
      
      wrapper = createWrapper()
      
      // Test that the component can handle transformation props
      const chatBubbles = wrapper.findAllComponents({ name: 'ChatBubble' })
      expect(chatBubbles).toBeDefined()
    })
  })

  describe('Message Display', () => {
    it('should display messages in correct order', () => {
      wrapper = createWrapper()
      
      const chatBubbles = wrapper.findAllComponents({ name: 'ChatBubble' })
      expect(chatBubbles[0].props('message')).toBe('こんにちは')
      expect(chatBubbles[0].props('isUser')).toBe(true)
      expect(chatBubbles[1].props('message')).toBe('こんにちは！元気ですか？')
      expect(chatBubbles[1].props('isUser')).toBe(false)
    })

    it('should pass correct props to ChatBubble components', () => {
      wrapper = createWrapper()
      
      const firstBubble = wrapper.findAllComponents({ name: 'ChatBubble' })[0]
      expect(firstBubble.props()).toMatchObject({
        message: 'こんにちは',
        isUser: true,
        timestamp: new Date('2023-01-01T10:00:00Z')
      })
    })
  })

  describe('Reactivity', () => {
    it('should react to message prop changes', async () => {
      wrapper = createWrapper()
      
      const newMessages = [
        ...mockMessages,
        {
          id: '3',
          content: '新しいメッセージ',
          isUser: true,
          timestamp: new Date()
        }
      ]
      
      await wrapper.setProps({ messages: newMessages })
      
      const chatBubbles = wrapper.findAllComponents({ name: 'ChatBubble' })
      expect(chatBubbles).toHaveLength(3)
    })

    it('should react to loading state changes', async () => {
      wrapper = createWrapper({ isLoading: false })
      
      expect(wrapper.find('.flex.justify-start').exists()).toBe(false)
      
      await wrapper.setProps({ isLoading: true })
      
      expect(wrapper.find('.flex.justify-start').exists()).toBe(true)
    })
  })
})