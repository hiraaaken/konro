import { vi } from 'vitest'

// Mock user info data
export const mockUserInfo = {
  age: "20代",
  gender: "男性",
  occupation: "会社員"
}

// Mock localStorage implementation
export const mockLocalStorage = {
  getItem: vi.fn((key: string) => {
    if (key === 'konro-user-info') {
      return JSON.stringify(mockUserInfo)
    }
    return null
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Helper function to reset localStorage mocks
export const resetLocalStorageMocks = () => {
  mockLocalStorage.getItem.mockClear()
  mockLocalStorage.setItem.mockClear()
  mockLocalStorage.removeItem.mockClear()
  mockLocalStorage.clear.mockClear()
}