// Domain types for Konro application

export type FireLevel = 'weak' | 'medium' | 'strong'

export interface UserInfo {
  age?: string
  gender?: string
  occupation?: string
}

export interface SelectOption {
  key: string
  label: string
}

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  fireLevel?: FireLevel
}

export interface ChatSession {
  id: string
  fireLevel: FireLevel
  startTime: Date
  endTime?: Date
  userInfo?: UserInfo
}

export interface EncouragementResponse {
  message: string
  fireLevel: FireLevel
  sessionId: string
}

// Fire Level Selector specific types
export interface FireLevelOption {
  level: FireLevel
  label: string
  description: string
  color: string
  intensity: string
}

export interface FireLevelSelection {
  selectedLevel: FireLevel | null
  isSelected: boolean
  timestamp?: Date
}