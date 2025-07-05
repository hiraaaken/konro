export interface ApiConfig {
  baseUrl: string
  apiKey?: string
  timeout: number
  retryAttempts: number
}

export const defaultApiConfig: ApiConfig = {
  baseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  apiKey: process.env.NUXT_PUBLIC_API_KEY,
  timeout: 30000, // 30 seconds
  retryAttempts: 3
}

export const endpoints = {
  chat: {
    startSession: '/sessions/start',
    sendMessage: '/chat/message',
    endSession: (sessionId: string) => `/sessions/${sessionId}/end`
  },
  health: '/health'
} as const