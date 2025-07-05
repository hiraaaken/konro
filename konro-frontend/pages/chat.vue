<template>
  <div class="h-screen bg-konro-dark flex flex-col">
    <!-- Chat Header with Fire Level and Exit Button -->
    <header class="bg-konro-surface shadow-sm px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <Icon :name="fireIcon" :class="fireIconClass" size="24" />
        <div>
          <h1 class="font-bold text-konro-primary">{{ fireLevelLabel }}</h1>
          <p class="text-sm text-konro-secondary">{{ fireDescription }}</p>
        </div>
      </div>
      
      <!-- コンロ消火ボタン -->
      <button
        @click="showExitDialog = true"
        class="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
      >
        <Icon name="power" size="16" />
        <span>消火</span>
      </button>
    </header>

    <!-- Main Chat Interface -->
    <main class="flex-1 overflow-hidden">
      <ChatInterface
        :messages="chatSession.messages"
        :is-loading="chatSession.isLoading"
        @send-message="handleSendMessage"
      />
    </main>

    <!-- Exit Confirmation Dialog -->
    <Dialog
      v-model="showExitDialog"
      title="チャットを終了しますか？"
      description="会話の内容は保存されません。本当に終了してもよろしいですか？"
      size="sm"
      cancel-text="継続"
      confirm-text="終了"
      confirm-variant="danger"
      :loading="isExiting"
      @confirm="handleExit"
      @cancel="showExitDialog = false"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <Icon name="warning" class="text-red-500" size="20" />
          <h3 class="text-lg font-bold text-white">チャットを終了しますか？</h3>
        </div>
      </template>
      
      <div>
        <p class="text-gray-300 mb-4">会話の内容は保存されません。</p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex items-start space-x-2">
            <Icon name="info" class="text-yellow-600 flex-shrink-0 mt-0.5" size="16" />
            <div class="text-sm text-yellow-700">
              <p>終了後は火力選択画面に戻ります。</p>
              <p>また同じ火力で再開することも可能です。</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFireLevelStore } from '~/stores/fireLevel'
import { useChatSessionStore } from '~/stores/chatSession'
import Dialog from '~/components/ui/Dialog.vue'
import Icon from '~/components/ui/Icon.vue'

const router = useRouter()
const fireLevelStore = useFireLevelStore()
const chatSessionStore = useChatSessionStore()

const showExitDialog = ref(false)
const isExiting = ref(false)

const fireLevel = computed(() => fireLevelStore.currentFireLevel)
const chatSession = computed(() => chatSessionStore.session)

const fireLevelLabel = computed(() => {
  if (!fireLevel.value) return ''
  return fireLevelStore.getFireLevelConfig(fireLevel.value).label
})

const fireDescription = computed(() => {
  if (!fireLevel.value) return ''
  return fireLevelStore.getFireLevelConfig(fireLevel.value).description
})

const fireIcon = computed(() => {
  switch (fireLevel.value) {
    case 'weak': return 'flame-weak'
    case 'medium': return 'flame-medium' 
    case 'strong': return 'flame-strong'
    default: return 'flame'
  }
})

const fireIconClass = computed(() => {
  switch (fireLevel.value) {
    case 'weak': return 'text-orange-400'
    case 'medium': return 'text-orange-500'
    case 'strong': return 'text-red-500'
    default: return 'text-orange-500'
  }
})

const handleSendMessage = async (message: string) => {
  try {
    await chatSessionStore.sendMessage(message)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleExit = async () => {
  isExiting.value = true
  
  try {  
    await chatSessionStore.endSession()
    showExitDialog.value = false
    await router.push('/goodbye')
  } catch (error) {
    console.error('Failed to end session:', error)
  } finally {
    isExiting.value = false
  }
}

// Navigation guard - redirect if no active session
onMounted(() => {
  if (!chatSession.value?.isActive) {
    router.push('/select')
  }
})

// Cleanup on unmount
onUnmounted(() => {
  // Auto-save session state if needed
})
</script>