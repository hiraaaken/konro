import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  age?: string
  gender?: string
  occupation?: string
}

export interface UserInfoOption {
  ages: string[]
  genders: string[]
  occupations: string[]
}

export const useUserInfoStore = defineStore('userInfo', () => {
  // User information configuration
  const userInfoOptions = ref<UserInfoOption>({
    ages: ['10代', '20代', '30代', '40代', '50代', '60代以上'],
    genders: ['男性', '女性', 'その他', '回答しない'],
    occupations: ['学生', '会社員', '公務員', '自営業', '専業主婦(夫)', 'その他']
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
        userInfo.value = JSON.parse(savedInfo)
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
    
    // API-compatible methods
    saveUserInfo: setUserInfo // Alias for API consistency
  }
})