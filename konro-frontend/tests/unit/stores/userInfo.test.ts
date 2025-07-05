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
      
      expect(options.ages.some(age => age.key === 'twenties' && age.label === '20代')).toBe(true)
      expect(options.genders.some(gender => gender.key === 'male' && gender.label === '男性')).toBe(true)
      expect(options.occupations.some(occupation => occupation.key === 'company_employee' && occupation.label === '会社員')).toBe(true)
    })
  })

  describe('User Information Management', () => {
    it('should_set_user_info_correctly', () => {
      store.setUserInfo({
        age: 'thirties',
        gender: 'male',
        occupation: 'company_employee'
      })
      
      expect(store.userInfo.age).toBe('thirties')
      expect(store.userInfo.gender).toBe('male')
      expect(store.userInfo.occupation).toBe('company_employee')
      expect(store.hasUserInfo).toBe(true)
      expect(store.isCompleteProfile).toBe(true)
    })

    it('should_set_individual_fields_correctly', () => {
      store.setAge('twenties')
      store.setGender('female')
      store.setOccupation('student')
      
      expect(store.userInfo.age).toBe('twenties')
      expect(store.userInfo.gender).toBe('female')
      expect(store.userInfo.occupation).toBe('student')
    })

    it('should_handle_partial_user_info', () => {
      store.setAge('forties')
      
      expect(store.hasUserInfo).toBe(true)
      expect(store.isCompleteProfile).toBe(false)
    })

    it('should_skip_user_info_when_requested', () => {
      store.skipUserInfo()
      
      expect(store.isSkipped).toBe(true)
    })

    it('should_clear_user_info_completely', () => {
      store.setUserInfo({
        age: 'thirties',
        gender: 'male',
        occupation: 'company_employee'
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
      store.setUserInfo({ age: 'thirties' })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'konro-user-info',
        JSON.stringify({ age: 'thirties' })
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
      const savedUserInfo = { age: 'twenties', gender: 'female' }
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
      
      store.setAge('thirties')
      expect(store.hasUserInfo).toBe(true)
      
      store.clearUserInfo()
      expect(store.hasUserInfo).toBe(false)
    })

    it('should_calculate_isCompleteProfile_correctly', () => {
      expect(store.isCompleteProfile).toBe(false)
      
      store.setAge('thirties')
      expect(store.isCompleteProfile).toBe(false)
      
      store.setGender('male')
      expect(store.isCompleteProfile).toBe(false)
      
      store.setOccupation('company_employee')
      expect(store.isCompleteProfile).toBe(true)
    })
  })

  describe('Label Helper Functions', () => {
    it('should_return_correct_labels_for_keys', () => {
      expect(store.getAgeLabel('twenties')).toBe('20代')
      expect(store.getGenderLabel('male')).toBe('男性')
      expect(store.getOccupationLabel('student')).toBe('学生')
    })

    it('should_return_key_itself_for_unknown_keys', () => {
      expect(store.getAgeLabel('unknown')).toBe('unknown')
      expect(store.getGenderLabel('unknown')).toBe('unknown')
      expect(store.getOccupationLabel('unknown')).toBe('unknown')
    })
  })
})