<template>
  <div class="min-h-screen bg-konro-dark flex items-center justify-center p-4">
    <div v-if="isLoading" class="text-center">
      <Icon name="flame" size="64" class="text-orange-500 animate-pulse mb-4" />
      <p class="text-konro-secondary">読み込み中...</p>
    </div>
    
    <div v-else class="max-w-md mx-auto text-center">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-4">
            <Icon name="flame" size="40" class="text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            Konro
          </h1>
          <p class="text-lg text-gray-600 mb-2">
            ポジティブ励ましチャットボット
          </p>
          <p class="text-sm text-gray-500">
            あなたの心に火を灯します
          </p>
        </div>
        
        <div class="space-y-4">
          <Button
            variant="primary"
            size="lg"
            :full-width="true"
            @click="startApp"
          >
            始める
          </Button>
          
          <NuxtLink 
            to="/demo"
            class="inline-block w-full px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            デモを見る
          </NuxtLink>
          
          <!-- Debug buttons -->
          <div class="space-y-2">
            <NuxtLink 
              to="/setup"
              class="inline-block w-full px-4 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-colors"
            >
              設定画面へ直接移動
            </NuxtLink>
            
            <Button
              variant="ghost"
              size="sm"
              :full-width="true"
              @click="clearStorage"
            >
              ストレージをクリア（デバッグ用）
            </Button>
          </div>
        </div>
        
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-400">
            Issue #9: User Onboarding Flow Implementation
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '~/stores/userInfo'
import Button from '~/components/ui/Button.vue'
import Icon from '~/components/ui/Icon.vue'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const isLoading = ref(true)

// Page meta
definePageMeta({
  title: 'Konro - ポジティブ励ましチャットボット'
})

// Initialize app and determine user flow
onMounted(async () => {
  console.log('onMounted called')
  console.log('Initial state - isInitialized:', userInfoStore.isInitialized)
  
  // Wait for store initialization
  await nextTick()
  
  // Check if user info store is ready
  if (!userInfoStore.isInitialized) {
    console.log('Loading from localStorage...')
    userInfoStore.loadFromLocalStorage()
  }
  
  console.log('After loading - isInitialized:', userInfoStore.isInitialized)
  console.log('After loading - hasUserInfo:', userInfoStore.hasUserInfo)
  console.log('After loading - isSkipped:', userInfoStore.isSkipped)
  
  isLoading.value = false
})

// Handle app start flow
function startApp() {
  console.log('startApp called')
  console.log('userInfoStore.isInitialized:', userInfoStore.isInitialized)
  console.log('userInfoStore.hasUserInfo:', userInfoStore.hasUserInfo)
  console.log('userInfoStore.isSkipped:', userInfoStore.isSkipped)
  console.log('userInfoStore.shouldShowUserInfoForm():', userInfoStore.shouldShowUserInfoForm())
  
  // Check if user should see user info form
  if (userInfoStore.shouldShowUserInfoForm()) {
    console.log('Redirecting to /setup')
    router.push('/setup')
  } else {
    console.log('Redirecting to /select')
    // User has already set up info or skipped, go to fire level selection
    router.push('/select')
  }
}

// Debug function to clear localStorage
function clearStorage() {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    userInfoStore.clearUserInfo()
    console.log('localStorage cleared')
    location.reload()
  }
}
</script>