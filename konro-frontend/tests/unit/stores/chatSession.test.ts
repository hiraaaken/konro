import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatSessionStore } from '../../../stores/chatSession'
import type { FireLevel } from '../../../types/domain'

describe('useChatSessionStore', () => {
  let store: ReturnType<typeof useChatSessionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useChatSessionStore()
    vi.clearAllTimers()
  })

  describe('Initial State', () => {
    it('should_have_default_state_when_initialized', () => {
      expect(store.currentSession).toBeNull()
      expect(store.isInChat).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.hasActiveSession).toBe(false)
      expect(store.messageCount).toBe(0)
      expect(store.lastMessage).toBeNull()
    })
  })

  describe('Session Management', () => {
    it('should_start_session_with_correct_fire_level', () => {
      store.startSession('medium')
      
      expect(store.currentSession).not.toBeNull()
      expect(store.currentSession?.fireLevel).toBe('medium')
      expect(store.isInChat).toBe(true)
      expect(store.hasActiveSession).toBe(true)
      expect(store.currentSession?.isActive).toBe(true)
    })

    it('should_add_initial_message_when_session_starts', () => {
      store.startSession('weak')
      
      expect(store.messageCount).toBe(1)
      expect(store.lastMessage?.isUser).toBe(false)
      expect(store.lastMessage?.content).toBe('お疲れさま。今日はどうしたの？何か辛いことでもあった？')
    })

    it('should_end_session_correctly', () => {
      store.startSession('strong')
      store.endSession()
      
      expect(store.isInChat).toBe(false)
      expect(store.currentSession?.isActive).toBe(false)
      expect(store.currentSession?.endTime).toBeDefined()
    })

    it('should_clear_session_after_timeout_when_ended', () => {
      vi.useFakeTimers()
      
      store.startSession('medium')
      store.endSession()
      
      expect(store.currentSession).not.toBeNull()
      
      vi.advanceTimersByTime(1001)
      
      expect(store.currentSession).toBeNull()
      
      vi.useRealTimers()
    })

    it('should_clear_session_completely', () => {
      store.startSession('weak')
      store.setLoading(true)
      store.clearSession()
      
      expect(store.currentSession).toBeNull()
      expect(store.isInChat).toBe(false)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('Message Management', () => {
    beforeEach(() => {
      store.startSession('medium')
    })

    it('should_add_user_message_correctly', () => {
      store.addUserMessage('Hello, I need help!')
      
      expect(store.messageCount).toBe(2) // Initial + user message
      expect(store.lastMessage?.isUser).toBe(true)
      expect(store.lastMessage?.content).toBe('Hello, I need help!')
    })

    it('should_add_bot_message_correctly', () => {
      store.addBotMessage('How can I help you?')
      
      expect(store.messageCount).toBe(2) // Initial + bot message
      expect(store.lastMessage?.isUser).toBe(false)
      expect(store.lastMessage?.content).toBe('How can I help you?')
    })

    it('should_add_processed_bot_message', () => {
      store.addBotMessage('Processed message', true)
      
      expect(store.lastMessage?.processed).toBe(true)
    })

    it('should_not_add_message_when_no_session', () => {
      store.clearSession()
      store.addUserMessage('This should not be added')
      
      expect(store.messageCount).toBe(0)
    })
  })

  describe('Loading State', () => {
    it('should_set_loading_state_correctly', () => {
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
      
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('Utility Methods', () => {
    it('should_generate_unique_session_ids', () => {
      store.startSession('weak')
      const firstId = store.currentSession?.id
      
      store.clearSession()
      store.startSession('medium')
      const secondId = store.currentSession?.id
      
      expect(firstId).not.toBe(secondId)
    })

    it('should_check_if_can_add_message', () => {
      expect(store.canAddMessage()).toBe(false)
      
      store.startSession('medium')
      expect(store.canAddMessage()).toBe(true)
      
      store.setLoading(true)
      expect(store.canAddMessage()).toBe(false)
      
      store.setLoading(false)
      expect(store.canAddMessage()).toBe(true)
      
      store.endSession()
      expect(store.canAddMessage()).toBe(false)
    })

    it('should_get_session_summary_correctly', async () => {
      expect(store.getSessionSummary()).toBeNull()
      
      store.startSession('strong')
      store.addUserMessage('Test message')
      
      // Wait a small amount to ensure duration is greater than 0
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const summary = store.getSessionSummary()
      
      expect(summary?.fireLevel).toBe('strong')
      expect(summary?.messageCount).toBe(2) // Initial + user message
      expect(summary?.isActive).toBe(true)
      expect(summary?.duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Initial Messages by Fire Level', () => {
    it('should_show_correct_initial_message_for_weak_fire', () => {
      store.startSession('weak')
      
      expect(store.lastMessage?.content).toBe('お疲れさま。今日はどうしたの？何か辛いことでもあった？')
    })

    it('should_show_correct_initial_message_for_medium_fire', () => {
      store.startSession('medium')
      
      expect(store.lastMessage?.content).toBe('やあ！今日はどんなことがあったんだい？話してみて！')
    })

    it('should_show_correct_initial_message_for_strong_fire', () => {
      store.startSession('strong')
      
      expect(store.lastMessage?.content).toBe('どうした！何があった！全部話せ！')
    })
  })

  describe('Computed Properties', () => {
    it('should_calculate_hasActiveSession_correctly', () => {
      expect(store.hasActiveSession).toBe(false)
      
      store.startSession('medium')
      expect(store.hasActiveSession).toBe(true)
      
      store.endSession()
      expect(store.hasActiveSession).toBe(false)
    })

    it('should_calculate_messageCount_correctly', () => {
      expect(store.messageCount).toBe(0)
      
      store.startSession('weak')
      expect(store.messageCount).toBe(1)
      
      store.addUserMessage('Hello')
      store.addBotMessage('Hi there')
      expect(store.messageCount).toBe(3)
    })

    it('should_calculate_lastMessage_correctly', () => {
      expect(store.lastMessage).toBeNull()
      
      store.startSession('medium')
      expect(store.lastMessage?.isUser).toBe(false)
      
      store.addUserMessage('User message')
      expect(store.lastMessage?.isUser).toBe(true)
      expect(store.lastMessage?.content).toBe('User message')
    })
  })
})