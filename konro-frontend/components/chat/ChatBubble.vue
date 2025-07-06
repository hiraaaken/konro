<template>
  <div
    :class="bubbleClasses"
    :data-testid="isUser ? 'chat-bubble-user' : 'chat-bubble-bot'"
  >
    <!-- Avatar for bot messages -->
    <div
      v-if="!isUser"
      class="flex-shrink-0 mr-3"
    >
      <Icon
        name="fire"
        size="lg"
        :color="avatarColor"
        class="p-2 rounded-full bg-orange-100"
      />
    </div>

    <!-- Message Content -->
    <div :class="messageClasses">
      <div 
        ref="messageContentRef"
        :class="contentClasses"
      >
        <slot>
          {{ message }}
        </slot>
      </div>
      
      <!-- Timestamp -->
      <div
        v-if="showTimestamp"
        class="text-xs text-gray-500 mt-1"
      >
        {{ formattedTimestamp }}
      </div>
    </div>

    <!-- Avatar for user messages -->
    <div
      v-if="isUser"
      class="flex-shrink-0 ml-3"
    >
      <Icon
        name="user"
        size="lg"
        color="secondary"
        class="p-2 rounded-full bg-gray-100"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import Icon from '../ui/Icon.vue'
import { useAnimation } from '~/composables/useAnimation'

interface Props {
  message?: string
  isUser: boolean
  timestamp?: Date
  showTimestamp?: boolean
  processed?: boolean
  detectedNegativeWords?: string[]
  wordTransformations?: Array<{ original: string; transformed: string }>
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  showTimestamp: true,
  processed: false,
  detectedNegativeWords: () => [],
  wordTransformations: () => []
})

const messageContentRef = ref<HTMLElement>()
const { animateNegativeWords } = useAnimation()

// Trigger animation when negative words are detected
watch(() => [props.detectedNegativeWords, props.wordTransformations], async ([negativeWords, transformations]) => {
  if (
    !props.isUser && 
    messageContentRef.value && 
    negativeWords && 
    negativeWords.length > 0 && 
    transformations && 
    transformations.length > 0
  ) {
    // Wait a bit for the message to render
    await nextTick()
    setTimeout(() => {
      if (messageContentRef.value) {
        animateNegativeWords(messageContentRef.value, negativeWords, transformations)
      }
    }, 500)
  }
}, { immediate: true })

const bubbleClasses = computed(() => [
  'flex items-end mb-4',
  {
    'justify-end': props.isUser,
    'justify-start': !props.isUser
  }
])

const messageClasses = computed(() => [
  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
  {
    'bg-orange-500 text-white rounded-br-none': props.isUser,
    'bg-gray-200 text-gray-800 rounded-bl-none': !props.isUser
  }
])

const contentClasses = computed(() => [
  'text-sm',
  {
    'font-medium': props.processed
  }
])

const avatarColor = computed(() => {
  return props.processed ? 'success' : 'primary'
})

const formattedTimestamp = computed(() => {
  if (!props.timestamp) {return ''}
  
  return props.timestamp.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>