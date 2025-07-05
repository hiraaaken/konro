<template>
  <div
    class="chat-interface h-full flex flex-col"
    :data-testid="'chat-interface'"
  >
    <!-- Chat Header -->
    <div class="flex-shrink-0 bg-gradient-to-r from-orange-400 to-red-500 text-white p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Icon
            name="fire"
            size="lg"
            class="mr-2"
          />
          <div>
            <h2 class="font-bold">{{ fireLevelLabel }}</h2>
            <p class="text-sm opacity-90">{{ fireLevelDescription }}</p>
          </div>
        </div>
        
        <!-- Exit Button -->
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          @click="handleExit"
        >
          消火
        </Button>
      </div>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      :data-testid="'messages-container'"
    >
      <ChatBubble
        v-for="message in messages"
        :key="message.id"
        :message="message.content"
        :is-user="message.isUser"
        :timestamp="message.timestamp"
        :processed="message.processed"
        :detected-negative-words="getMessageNegativeWords(message)"
        :word-transformations="getMessageTransformations(message)"
      />
      
      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-200 rounded-lg p-3">
          <Icon
            name="loading"
            :animated="true"
            class="mr-2"
          />
          考え中...
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex-shrink-0 border-t bg-white p-4">
      <div class="flex items-end space-x-2">
        <div class="flex-1">
          <Input
            v-model="inputMessage"
            type="text"
            placeholder="メッセージを入力してください..."
            :disabled="isLoading"
            @keydown.enter="handleSendMessage"
          />
        </div>
        <Button
          :disabled="!canSendMessage"
          :loading="isLoading"
          icon="arrow-right"
          @click="handleSendMessage"
        >
          送信
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatSessionStore } from '../../stores/chatSession'
import { useFireLevelStore } from '../../stores/fireLevel'
import { useAnimation } from '../../composables/useAnimation'
import ChatBubble from './ChatBubble.vue'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import Icon from '../ui/Icon.vue'
import type { FireLevel } from '../../types/domain'

interface Emits {
  (e: 'exit'): void
}

const emit = defineEmits<Emits>()

// Stores
const chatStore = useChatSessionStore()
const fireLevelStore = useFireLevelStore()

// State
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// Reactive data from stores
const { currentSession, isLoading } = storeToRefs(chatStore)
const { selectedFireLevel } = storeToRefs(fireLevelStore)

// Computed properties
const messages = computed(() => currentSession.value?.messages || [])

const canSendMessage = computed(() => {
  return inputMessage.value.trim() && !isLoading.value && chatStore.canAddMessage()
})

const fireLevelLabel = computed(() => {
  if (!selectedFireLevel.value) return ''
  const option = fireLevelStore.getFireLevelOption(selectedFireLevel.value)
  return option?.label || ''
})

const fireLevelDescription = computed(() => {
  if (!selectedFireLevel.value) return ''
  const option = fireLevelStore.getFireLevelOption(selectedFireLevel.value)
  return option?.description || ''
})

// Methods
async function handleSendMessage() {
  if (!canSendMessage.value) return
  
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  
  try {
    // Use the store's sendMessage method which handles API integration
    await chatStore.sendMessage(message)
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    // Re-enable input on error
    inputMessage.value = message
  }
}

function generateBotResponse(userMessage: string): string {
  // This is a placeholder - replace with actual AI integration
  const responses = {
    weak: [
      'そうですね、お疲れさまでした。どんなことが大変でしたか？',
      'ゆっくりお話しください。あなたのペースで大丈夫です。',
      '今日も一日、本当にお疲れさまでした。'
    ],
    medium: [
      'なるほど！それは大変でしたね。でも頑張りましたね！',
      'きっと明日はもっと良い日になりますよ！',
      'あなたならきっと乗り越えられます！'
    ],
    strong: [
      'そんなことで諦めるな！お前ならできる！',
      '弱音を吐いている暇があったら行動しろ！',
      '困難は成長のチャンスだ！立ち上がれ！'
    ]
  }
  
  const level = selectedFireLevel.value || 'medium'
  const levelResponses = responses[level]
  return levelResponses[Math.floor(Math.random() * levelResponses.length)]
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleExit() {
  emit('exit')
}

// Animation-related methods
function getMessageNegativeWords(message: any): string[] {
  // For user messages, detect negative words for potential animation
  if (message.isUser) {
    const { detectNegativeWords } = useAnimation()
    return detectNegativeWords(message.content)
  }
  // For bot messages, return any stored negative words from API response
  return message.detectedNegativeWords || []
}

function getMessageTransformations(message: any): Array<{ original: string; transformed: string }> {
  // Return transformations for bot messages that processed user negative words
  return message.wordTransformations || []
}

// Watch for new messages and scroll to bottom
watch(messages, scrollToBottom, { deep: true })
</script>