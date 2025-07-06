<template>
  <div
    class="chat-interface h-full flex flex-col"
    :data-testid="'chat-interface'"
  >
    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      :data-testid="'messages-container'"
    >
      <ChatBubble
        v-for="message in props.messages"
        :key="message.id"
        :message="message.content"
        :is-user="message.isUser"
        :timestamp="message.timestamp"
        :processed="message.processed"
        :detected-negative-words="getMessageNegativeWords(message)"
        :word-transformations="getMessageTransformations(message)"
      />
      
      <!-- Loading indicator -->
      <div
        v-if="props.isLoading"
        class="flex justify-start"
      >
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
            :disabled="props.isLoading"
            @keydown.enter="handleSendMessage"
          />
        </div>
        <Button
          :disabled="!canSendMessage"
          :loading="props.isLoading"
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
import { useAnimation } from '../../composables/useAnimation'
import ChatBubble from './ChatBubble.vue'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import Icon from '../ui/Icon.vue'
import type { ChatMessage } from '../../stores/chatSession'

interface Props {
  messages: ChatMessage[]
  isLoading: boolean
}

interface Emits {
  (e: 'send-message', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// Computed properties
const canSendMessage = computed(() => {
  return inputMessage.value.trim() && !props.isLoading
})


// Methods
async function handleSendMessage() {
  if (!canSendMessage.value) {return}
  
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  
  try {
    // Emit the message to parent component
    emit('send-message', message)
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    // Re-enable input on error
    inputMessage.value = message
  }
}


async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}


// Animation-related methods
function getMessageNegativeWords(message: ChatMessage): string[] {
  // For user messages, detect negative words for potential animation
  if (message.isUser) {
    const { detectNegativeWords } = useAnimation()
    return detectNegativeWords(message.content)
  }
  // For bot messages, return any stored negative words from API response
  return message.detectedNegativeWords || []
}

function getMessageTransformations(message: ChatMessage): Array<{ original: string; transformed: string }> {
  // Return transformations for bot messages that processed user negative words
  return message.wordTransformations || []
}

// Watch for new messages and scroll to bottom
watch(() => props.messages, scrollToBottom, { deep: true })
</script>