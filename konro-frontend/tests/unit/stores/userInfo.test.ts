import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserInfoStore } from '../../../stores/userInfo'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('useUserInfoStore', () => {
  let store: ReturnType<typeof useUserInfoStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    store = useUserInfoStore()
  })

  describe('Initial State', () => {
    it('should_have_default_state_when_initialized', () => {
      expect(store.userInfo).toEqual({})
      expect(store.isSkipped).toBe(false)
      expect(store.hasUserInfo).toBe(false)
      expect(store.isCompleteProfile).toBe(false)
    })

    it('should_have_correct_user_info_options', () => {
      const options = store.userInfoOptions
      
      expect(options.ages).toContain('20代')
      expect(options.genders).toContain('男性')
      expect(options.occupations).toContain('会社員')
    })
  })

  describe('User Information Management', () => {
    it('should_set_user_info_correctly', () => {
      store.setUserInfo({
        age: '30代',
        gender: '男性',
        occupation: '会社員'
      })
      
      expect(store.userInfo.age).toBe('30代')
      expect(store.userInfo.gender).toBe('男性')
      expect(store.userInfo.occupation).toBe('会社員')
      expect(store.hasUserInfo).toBe(true)
      expect(store.isCompleteProfile).toBe(true)
    })

    it('should_set_individual_fields_correctly', () => {
      store.setAge('20代')
      store.setGender('女性')
      store.setOccupation('学生')
      
      expect(store.userInfo.age).toBe('20代')
      expect(store.userInfo.gender).toBe('女性')
      expect(store.userInfo.occupation).toBe('学生')
    })

    it('should_handle_partial_user_info', () => {
      store.setAge('40代')
      
      expect(store.hasUserInfo).toBe(true)
      expect(store.isCompleteProfile).toBe(false)
    })

    it('should_skip_user_info_when_requested', () => {
      store.skipUserInfo()
      
      expect(store.isSkipped).toBe(true)
    })

    it('should_clear_user_info_completely', () => {
      store.setUserInfo({
        age: '30代',
        gender: '男性',
        occupation: '会社員'
      })
      store.skipUserInfo()
      
      store.clearUserInfo()
      
      expect(store.userInfo).toEqual({})
      expect(store.isSkipped).toBe(false)
      expect(store.hasUserInfo).toBe(false)
    })
  })

  describe('Local Storage Integration', () => {
    it('should_save_to_localStorage_when_user_info_set', () => {
      store.setUserInfo({ age: '30代' })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'konro-user-info',
        JSON.stringify({ age: '30代' })
      )
    })

    it('should_save_skipped_status_to_localStorage', () => {
      store.skipUserInfo()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'konro-user-info-skipped',
        'true'
      )
    })

    it('should_load_from_localStorage_on_initialization', () => {
      const savedUserInfo = { age: '25代', gender: '女性' }
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'konro-user-info') {
          return JSON.stringify(savedUserInfo)
        }
        if (key === 'konro-user-info-skipped') {
          return 'true'
        }
        return null
      })
      
      const newStore = useUserInfoStore()
      newStore.loadFromLocalStorage()
      
      expect(newStore.userInfo).toEqual(savedUserInfo)
      expect(newStore.isSkipped).toBe(true)
    })

    it('should_remove_from_localStorage_when_cleared', () => {
      store.clearUserInfo()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('konro-user-info')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('konro-user-info-skipped')
    })
  })

  describe('UI Flow Logic', () => {
    it('should_show_form_when_no_info_and_not_skipped', () => {
      expect(store.shouldShowUserInfoForm()).toBe(true)
    })

    it('should_not_show_form_when_user_info_exists', () => {
      store.setAge('30代')
      
      expect(store.shouldShowUserInfoForm()).toBe(false)
    })

    it('should_not_show_form_when_skipped', () => {
      store.skipUserInfo()
      
      expect(store.shouldShowUserInfoForm()).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('should_calculate_hasUserInfo_correctly', () => {
      expect(store.hasUserInfo).toBe(false)
      
      store.setAge('30代')
      expect(store.hasUserInfo).toBe(true)
      
      store.clearUserInfo()
      expect(store.hasUserInfo).toBe(false)
    })

    it('should_calculate_isCompleteProfile_correctly', () => {
      expect(store.isCompleteProfile).toBe(false)
      
      store.setAge('30代')
      expect(store.isCompleteProfile).toBe(false)
      
      store.setGender('男性')
      expect(store.isCompleteProfile).toBe(false)
      
      store.setOccupation('会社員')
      expect(store.isCompleteProfile).toBe(true)
    })
  })
})