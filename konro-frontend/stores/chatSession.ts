import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FireLevel } from '../types/domain'

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  processed?: boolean
  detectedNegativeWords?: string[]
  wordTransformations?: Array<{ original: string; transformed: string }>
}

export interface ChatSession {
  id: string
  fireLevel: FireLevel
  messages: ChatMessage[]
  isActive: boolean
  startTime: Date
  endTime?: Date
}

export const useChatSessionStore = defineStore('chatSession', () => {
  // Chat session state
  const currentSession = ref<ChatSession | null>(null)
  const isInChat = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const recentlyEndedTimestamp = ref<number | null>(null)

  // Computed properties
  const hasActiveSession = computed(() => {
    return currentSession.value !== null && isInChat.value
  })

  const messageCount = computed(() => {
    return currentSession.value?.messages.length || 0
  })

  const lastMessage = computed(() => {
    if (!currentSession.value?.messages.length) return null
    return currentSession.value.messages[currentSession.value.messages.length - 1]
  })

  const recentlyEnded = computed(() => {
    if (!recentlyEndedTimestamp.value) return false
    const timeSinceEnd = Date.now() - recentlyEndedTimestamp.value
    return timeSinceEnd < 30000 // 30 seconds
  })

  const session = computed(() => ({
    messages: currentSession.value?.messages || [],
    isActive: currentSession.value?.isActive || false,
    isLoading: isLoading.value
  }))

  // Actions
  function startSession(fireLevel: FireLevel) {
    const sessionId = generateSessionId()
    
    currentSession.value = {
      id: sessionId,
      fireLevel,
      messages: [],
      isActive: true,
      startTime: new Date()
    }
    
    isInChat.value = true
    
    // Add initial bot message based on fire level
    addBotMessage(getInitialMessage(fireLevel))
    
    // Initialize API session in background (non-blocking)
    if (typeof window !== 'undefined') {
      initializeApiSession(fireLevel, sessionId)
    }
  }

  async function initializeApiSession(fireLevel: FireLevel, sessionId: string) {
    try {
      const { chatApiService } = await import('~/services/api')
      
      const response = await chatApiService.startSession({
        fireLevel,
        userInfo: getUserInfo()
      })
      
      // Update session ID with API response if needed
      if (currentSession.value && currentSession.value.id === sessionId) {
        currentSession.value.id = response.sessionId
      }
    } catch (error) {
      console.warn('Failed to initialize API session, continuing with local session:', error)
    }
  }

  function addUserMessage(content: string) {
    if (!currentSession.value) return
    
    const message: ChatMessage = {
      id: generateMessageId(),
      content,
      isUser: true,
      timestamp: new Date()
    }
    
    currentSession.value.messages.push(message)
  }

  function addBotMessage(
    content: string, 
    processed = false,
    detectedNegativeWords?: string[],
    wordTransformations?: Array<{ original: string; transformed: string }>
  ) {
    if (!currentSession.value) return
    
    const message: ChatMessage = {
      id: generateMessageId(),
      content,
      isUser: false,
      timestamp: new Date(),
      processed,
      detectedNegativeWords,
      wordTransformations
    }
    
    currentSession.value.messages.push(message)
  }

  async function sendMessage(message: string) {
    if (!canAddMessage()) return
    
    setLoading(true)
    
    try {
      // Add user message
      addUserMessage(message)
      
      // Import API service dynamically to avoid SSR issues
      const { chatApiService } = await import('~/services/api')
      
      // Send message to API
      const response = await chatApiService.sendMessage({
        message,
        fireLevel: currentSession.value!.fireLevel,
        sessionId: currentSession.value!.id,
        userInfo: getUserInfo() // Will need to get this from user store
      })
      
      // Add bot response with animation data
      addBotMessage(
        response.response, 
        response.transformedWords && response.transformedWords.length > 0,
        response.detectedNegativeWords,
        response.transformedWords
      )
      
    } catch (error) {
      console.error('Failed to send message:', error)
      addBotMessage('申し訳ありません。エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  function endSession() {
    if (currentSession.value) {
      currentSession.value.isActive = false
      currentSession.value.endTime = new Date()
      recentlyEndedTimestamp.value = Date.now()
    }
    
    isInChat.value = false
    
    // Clear session data after a short delay (privacy consideration)
    setTimeout(() => {
      currentSession.value = null
    }, 1000)
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function clearSession() {
    currentSession.value = null
    isInChat.value = false
    isLoading.value = false
  }

  // Utility functions
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function getInitialMessage(fireLevel: FireLevel): string {
    const messages = {
      weak: 'お疲れさま。今日はどうしたの？何か辛いことでもあった？',
      medium: 'やあ！今日はどんなことがあったんだい？話してみて！',
      strong: 'どうした！何があった！全部話せ！'
    }
    
    return messages[fireLevel] || messages.medium
  }

  function generateBotResponse(userMessage: string, fireLevel: FireLevel): string {
    // Placeholder response generation - will be replaced with AI API
    const responses = {
      weak: [
        'そうなんですね。大変でしたね。あなたの気持ちがよく分かります。',
        'つらい思いをされているんですね。一人で抱え込まないでくださいね。',
        'お疲れさまです。そんな風に感じるのは自然なことですよ。'
      ],
      medium: [
        '大丈夫！きっとうまくいくよ！前向きに考えてみよう！',
        'そういう時もあるさ！でも君ならきっと乗り越えられるよ！',
        '辛いこともあるけど、それを乗り越えた時の成長は大きいはず！'
      ],
      strong: [
        'そんなことで負けるな！お前はもっと強いはずだ！',
        '弱音を吐いてる場合じゃない！立ち上がれ！',
        'その程度で諦めるのか！やればできるんだ！'
      ]
    }
    
    const levelResponses = responses[fireLevel] || responses.medium
    return levelResponses[Math.floor(Math.random() * levelResponses.length)]
  }

  function getUserInfo() {
    // Get user info from user store
    try {
      const { useUserInfoStore } = require('~/stores/userInfo')
      const userInfoStore = useUserInfoStore()
      return {
        age: userInfoStore.userInfo.age,
        gender: userInfoStore.userInfo.gender,
        occupation: userInfoStore.userInfo.occupation
      }
    } catch (error) {
      console.warn('Failed to get user info:', error)
      return undefined
    }
  }

  function canAddMessage(): boolean {
    return hasActiveSession.value && !isLoading.value
  }

  function getSessionSummary() {
    if (!currentSession.value) return null
    
    return {
      id: currentSession.value.id,
      fireLevel: currentSession.value.fireLevel,
      messageCount: currentSession.value.messages.length,
      duration: currentSession.value.endTime 
        ? currentSession.value.endTime.getTime() - currentSession.value.startTime.getTime()
        : Date.now() - currentSession.value.startTime.getTime(),
      isActive: currentSession.value.isActive
    }
  }

  return {
    // State
    currentSession,
    isInChat,
    isLoading,
    hasActiveSession,
    messageCount,
    lastMessage,
    recentlyEnded,
    session,
    
    // Actions
    startSession,
    sendMessage,
    addUserMessage,
    addBotMessage,
    endSession,
    setLoading,
    clearSession,
    
    // Utilities
    canAddMessage,
    getSessionSummary
  }
})