<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
    <!-- Header -->
    <header class="text-center py-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">Konro</h1>
      <p class="text-lg text-gray-600">今日の励まし火力を選んでください</p>
    </header>

    <!-- Fire Level Selector -->
    <main class="flex-1 flex items-center justify-center px-4">
      <FireLevelSelector 
        @fire-level-selected="handleFireLevelSelected"
        :loading="isTransitioning"
      />
    </main>

    <!-- Fire Toggle Demo (just for visual appeal) -->
    <div class="flex justify-center py-6">
      <FireToggle
        :model-value="true"
        :fire-level="selectedFireLevel || 'medium'"
        size="sm"
        :animated="true"
        :show-status="false"
        disabled
      />
    </div>

    <!-- Footer -->
    <footer class="text-center py-6">
      <button 
        @click="goToSettings"
        class="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        設定を変更する
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFireLevelStore } from '~/stores/fireLevel'
import { useChatSessionStore } from '~/stores/chatSession'
import FireToggle from '~/components/ui/FireToggle.vue'
import type { FireLevel } from '~/types/domain'

const router = useRouter()
const fireLevelStore = useFireLevelStore()
const chatSessionStore = useChatSessionStore()
const isTransitioning = ref(false)

const selectedFireLevel = computed(() => fireLevelStore.currentFireLevel)

const handleFireLevelSelected = async (fireLevel: FireLevel) => {
  isTransitioning.value = true
  
  try {
    // Set fire level
    fireLevelStore.setFireLevel(fireLevel)
    
    // Initialize chat session with selected fire level
    await chatSessionStore.startSession(fireLevel)
    
    // Navigate to chat
    await router.push('/chat')
  } catch (error) {
    console.error('Failed to start chat session:', error)
  } finally {
    isTransitioning.value = false
  }
}

const goToSettings = () => {
  router.push('/setup')
}
</script>