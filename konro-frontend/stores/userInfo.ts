import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  age?: string
  gender?: string
  occupation?: string
}

export interface SelectOption {
  key: string
  label: string
}

export interface UserInfoOption {
  ages: SelectOption[]
  genders: SelectOption[]
  occupations: SelectOption[]
}

export const useUserInfoStore = defineStore('userInfo', () => {
  // User information configuration
  const userInfoOptions = ref<UserInfoOption>({
    ages: [
      { key: 'teens', label: '10代' },
      { key: 'twenties', label: '20代' },
      { key: 'thirties', label: '30代' },
      { key: 'forties', label: '40代' },
      { key: 'fifties', label: '50代' },
      { key: 'sixties_plus', label: '60代以上' }
    ],
    genders: [
      { key: 'male', label: '男性' },
      { key: 'female', label: '女性' },
      { key: 'other', label: 'その他' },
      { key: 'no_answer', label: '回答しない' }
    ],
    occupations: [
      { key: 'student', label: '学生' },
      { key: 'company_employee', label: '会社員' },
      { key: 'civil_servant', label: '公務員' },
      { key: 'self_employed', label: '自営業' },
      { key: 'housewife_husband', label: '専業主婦(夫)' },
      { key: 'other', label: 'その他' }
    ]
  })

  // User information state
  const userInfo = ref<UserInfo>({})
  const isSkipped = ref<boolean>(false)
  const isInitialized = ref<boolean>(false)

  // Computed properties
  const hasUserInfo = computed(() => {
    return !!(userInfo.value.age || userInfo.value.gender || userInfo.value.occupation)
  })

  const isCompleteProfile = computed(() => {
    return !!(userInfo.value.age && userInfo.value.gender && userInfo.value.occupation)
  })

  // Actions
  function setUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
    saveToLocalStorage()
  }

  function setAge(age: string) {
    userInfo.value.age = age
    saveToLocalStorage()
  }

  function setGender(gender: string) {
    userInfo.value.gender = gender
    saveToLocalStorage()
  }

  function setOccupation(occupation: string) {
    userInfo.value.occupation = occupation
    saveToLocalStorage()
  }

  function skipUserInfo() {
    isSkipped.value = true
    saveSkippedStatus()
  }

  function clearUserInfo() {
    userInfo.value = {}
    isSkipped.value = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem('konro-user-info')
      localStorage.removeItem('konro-user-info-skipped')
    }
  }

  function loadFromLocalStorage() {
    if (typeof window === 'undefined') return

    try {
      const savedInfo = localStorage.getItem('konro-user-info')
      const savedSkipped = localStorage.getItem('konro-user-info-skipped')
      
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo)
        
        // Migrate old data format (label-based) to new format (key-based)
        userInfo.value = {
          age: migrateAgeToKey(parsed.age),
          gender: migrateGenderToKey(parsed.gender),
          occupation: migrateOccupationToKey(parsed.occupation)
        }
      }
      
      if (savedSkipped) {
        isSkipped.value = JSON.parse(savedSkipped)
      }
      
      isInitialized.value = true
    } catch (error) {
      console.warn('Failed to load user info from localStorage:', error)
      isInitialized.value = true
    }
  }

  // Migration helpers for old data format
  function migrateAgeToKey(age?: string): string | undefined {
    if (!age) return undefined
    const option = userInfoOptions.value.ages.find(a => a.label === age)
    return option ? option.key : age
  }

  function migrateGenderToKey(gender?: string): string | undefined {
    if (!gender) return undefined
    const option = userInfoOptions.value.genders.find(g => g.label === gender)
    return option ? option.key : gender
  }

  function migrateOccupationToKey(occupation?: string): string | undefined {
    if (!occupation) return undefined
    const option = userInfoOptions.value.occupations.find(o => o.label === occupation)
    return option ? option.key : occupation
  }

  function saveToLocalStorage() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('konro-user-info', JSON.stringify(userInfo.value))
    } catch (error) {
      console.warn('Failed to save user info to localStorage:', error)
    }
  }

  function saveSkippedStatus() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('konro-user-info-skipped', JSON.stringify(isSkipped.value))
    } catch (error) {
      console.warn('Failed to save skipped status to localStorage:', error)
    }
  }

  function shouldShowUserInfoForm(): boolean {
    return !isInitialized.value || (!hasUserInfo.value && !isSkipped.value)
  }

  // Helper functions to get labels from keys
  function getAgeLabel(key: string): string {
    const option = userInfoOptions.value.ages.find(age => age.key === key)
    return option?.label || key
  }

  function getGenderLabel(key: string): string {
    const option = userInfoOptions.value.genders.find(gender => gender.key === key)
    return option?.label || key
  }

  function getOccupationLabel(key: string): string {
    const option = userInfoOptions.value.occupations.find(occupation => occupation.key === key)
    return option?.label || key
  }

  // Initialize on store creation
  if (typeof window !== 'undefined') {
    loadFromLocalStorage()
  }

  return {
    // State
    userInfoOptions,
    userInfo,
    isSkipped,
    isInitialized,
    hasUserInfo,
    isCompleteProfile,
    
    // Actions
    setUserInfo,
    setAge,
    setGender,
    setOccupation,
    skipUserInfo,
    clearUserInfo,
    loadFromLocalStorage,
    loadUserInfo: loadFromLocalStorage, // Alias for consistency
    shouldShowUserInfoForm,
    
    // Helper functions
    getAgeLabel,
    getGenderLabel,
    getOccupationLabel,
    
    // API-compatible methods
    saveUserInfo: setUserInfo // Alias for API consistency
  }
})