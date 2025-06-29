import { describe, it, expect } from 'vitest'

describe('Basic Setup Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello Konro!'
    expect(greeting).toContain('Konro')
    expect(greeting.length).toBeGreaterThan(0)
  })
})