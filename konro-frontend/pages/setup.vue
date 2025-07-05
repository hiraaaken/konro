<template>
  <div class="min-h-screen bg-konro-dark flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-konro-primary mb-2">Konro</h1>
        <p class="text-konro-secondary">あなたのことを教えてください</p>
        <p class="text-sm text-konro-secondary mt-2">（この情報はあなたの端末にのみ保存されます）</p>
      </div>
      
      <UserInfoForm 
        @submit="handleSubmit" 
        @skip="handleSkip"
        :loading="isSubmitting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '~/stores/userInfo'
import type { UserInfo } from '~/types/domain'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const isSubmitting = ref(false)

const handleSubmit = async (userInfo: UserInfo) => {
  isSubmitting.value = true
  try {
    await userInfoStore.saveUserInfo(userInfo)
    await router.push('/select')
  } catch (error) {
    console.error('Failed to save user info:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSkip = async () => {
  await router.push('/select')
}

// Check if user is returning (has existing info)
onMounted(() => {
  if (userInfoStore.hasUserInfo) {
    router.push('/select')
  }
})
</script>