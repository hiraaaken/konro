// API types for Konro application
import type { FireLevel, UserInfo } from '../domain'

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type StartChatRequest = {
  fireLevel: FireLevel
  userInfo?: UserInfo
}

export type StartChatResponse = {
  sessionId: string
  welcomeMessage: string
}

export type SendMessageRequest = {
  sessionId: string
  message: string
  fireLevel: FireLevel
}

export type SendMessageResponse = {
  message: string
  fireLevel: FireLevel
  sessionId: string
}

export type EndChatRequest = {
  sessionId: string
}