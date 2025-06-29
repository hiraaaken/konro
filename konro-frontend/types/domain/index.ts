// Domain types for Konro application

export type FireLevel = 'weak' | 'medium' | 'strong'

export type UserInfo = {
  age?: string
  gender?: string
  occupation?: string
}

export type ChatMessage = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  fireLevel?: FireLevel
}

export type ChatSession = {
  id: string
  fireLevel: FireLevel
  startTime: Date
  endTime?: Date
  userInfo?: UserInfo
}

export type EncouragementResponse = {
  message: string
  fireLevel: FireLevel
  sessionId: string
}