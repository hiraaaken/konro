import { vi } from 'vitest'

// Mock API responses for chat functionality
export const mockChatResponse = {
  success: true,
  data: {
    message: "頑張って！きっとうまくいくよ！",
    fireLevel: "medium",
    sessionId: "test-session-123"
  }
}

export const mockStartChatResponse = {
  success: true,
  data: {
    sessionId: "test-session-123",
    welcomeMessage: "お疲れさま。今日はどうしたの？何か辛いことでもあった？"
  }
}

// Mock API client
export const mockApiClient = {
  startChat: vi.fn().mockResolvedValue(mockStartChatResponse),
  sendMessage: vi.fn().mockResolvedValue(mockChatResponse),
  endChat: vi.fn().mockResolvedValue({ success: true })
}