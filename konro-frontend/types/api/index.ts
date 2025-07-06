// API types for Konro application
import type { FireLevel, UserInfo } from '../domain'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface StartChatRequest {
  fireLevel: FireLevel
  userInfo?: UserInfo
}

export interface StartChatResponse {
  sessionId: string
  welcomeMessage: string
}

export interface SendMessageRequest {
  sessionId: string
  message: string
  fireLevel: FireLevel
}

export interface SendMessageResponse {
  message: string
  fireLevel: FireLevel
  sessionId: string
}

export interface EndChatRequest {
  sessionId: string
}