<template>
  <div class="min-h-screen bg-konro-dark flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <!-- Animated Fire Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
          <Icon
            name="flame"
            size="48"
            class="text-orange-500 animate-pulse"
          />
        </div>
        <h1 class="text-2xl font-bold text-konro-primary mb-2">
          お疲れさまでした
        </h1>
      </div>

      <!-- Farewell Message based on Fire Level -->
      <div class="bg-white rounded-lg p-6 shadow-sm mb-8">
        <p class="text-konro-secondary leading-relaxed">
          {{ farewellMessage }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          class="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          @click="startNewSession"
        >
          もう一度話す
        </button>
        
        <button
          class="w-full px-6 py-3 border border-gray-600 text-konro-secondary hover:bg-konro-surface rounded-lg font-medium transition-colors"
          @click="goToSelect"
        >
          火力を変更して話す
        </button>
      </div>

      <!-- Footer -->
      <footer class="mt-8 text-sm text-konro-secondary">
        <p>いつでもまた話しかけてくださいね</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFireLevelStore } from '~/stores/fireLevel'
import { useChatSessionStore } from '~/stores/chatSession'

const router = useRouter()
const fireLevelStore = useFireLevelStore()
const chatSessionStore = useChatSessionStore()

const lastFireLevel = computed(() => fireLevelStore.currentFireLevel)

const farewellMessage = computed(() => {
  switch (lastFireLevel.value) {
    case 'weak':
      return 'ゆっくり休んで、また元気になったら話しましょう。あなたのペースで大丈夫ですよ。心から応援しています。'
    case 'medium':
      return 'お疲れさまでした！今日も一日よく頑張りましたね。また何かあったらいつでも話しかけてください。'
    case 'strong':
      return 'よくやった！お前は最高だ！また困ったことがあったら遠慮なく来い！いつでも全力で応援してやるからな！'
    default:
      return 'また何かあったら、いつでも話しかけてくださいね。'
  }
})

const startNewSession = async () => {
  if (!lastFireLevel.value) {
    await router.push('/select')
    return
  }
  
  try {
    await chatSessionStore.startSession(lastFireLevel.value)
    await router.push('/chat')
  } catch (error) {
    console.error('Failed to start new session:', error)
    await router.push('/select')
  }
}

const goToSelect = async () => {
  await router.push('/select')
}

// Auto-redirect if accessed without proper session end
onMounted(() => {
  // Allow access for 10 seconds after session end
  setTimeout(() => {
    if (!chatSessionStore.recentlyEnded) {
      router.push('/select')
    }
  }, 10000)
})
</script>