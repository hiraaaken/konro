<template>
  <div class="min-h-screen bg-konro-dark p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-konro-primary mb-4">
          🔥 Konro - Fire Level Selector Demo
        </h1>
        <p class="text-lg text-konro-secondary">
          ポジティブ励ましチャットボットの火力選択コンポーネント
        </p>
      </header>

      <!-- Demo Section -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Fire Level Selector Component
        </h2>
        
        <!-- Component Demo -->
        <FireLevelSelector
          :initial-selected="selectedLevel"
          :disabled="isDisabled"
          @fire-level-selected="handleFireLevelSelected"
          @continue="handleContinue"
        />
      </div>

      <!-- Control Panel -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Demo Controls</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Current State -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Current State</h4>
            <div class="space-y-2">
              <p class="text-sm">
                <span class="font-medium">Selected Level:</span> 
                <span class="px-2 py-1 bg-gray-100 rounded">
                  {{ selectedLevel || 'None' }}
                </span>
              </p>
              <p class="text-sm">
                <span class="font-medium">Disabled:</span> 
                <span class="px-2 py-1 bg-gray-100 rounded">
                  {{ isDisabled ? 'Yes' : 'No' }}
                </span>
              </p>
              <p class="text-sm">
                <span class="font-medium">Last Event:</span> 
                <span class="px-2 py-1 bg-gray-100 rounded">
                  {{ lastEvent || 'None' }}
                </span>
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Controls</h4>
            <div class="space-y-3">
              <div>
                <label class="flex items-center space-x-2">
                  <input 
                    v-model="isDisabled" 
                    type="checkbox"
                    class="rounded"
                  >
                  <span class="text-sm">Disable Component</span>
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Initial Selection
                </label>
                <select 
                  v-model="selectedLevel" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option :value="null">None</option>
                  <option value="weak">弱火 (Weak)</option>
                  <option value="medium">中火 (Medium)</option>
                  <option value="strong">強火 (Strong)</option>
                </select>
              </div>

              <button
                @click="resetDemo"
                class="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Log -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Event Log</h3>
        
        <div class="max-h-40 overflow-y-auto">
          <div v-if="eventLog.length === 0" class="text-gray-500 text-sm">
            No events yet. Interact with the component above.
          </div>
          
          <div 
            v-for="(event, index) in eventLog" 
            :key="index"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <span class="text-sm font-medium">{{ event.type }}</span>
            <span class="text-sm text-gray-600">{{ event.data }}</span>
            <span class="text-xs text-gray-400">{{ event.timestamp }}</span>
          </div>
        </div>
        
        <button
          v-if="eventLog.length > 0"
          @click="clearEventLog"
          class="mt-4 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
        >
          Clear Log
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FireLevel } from '../types/domain'
import FireLevelSelector from '../components/fire-level/FireLevelSelector.vue'

// Demo state
const selectedLevel = ref<FireLevel | null>(null)
const isDisabled = ref(false)
const lastEvent = ref<string>('')

// Event logging
interface EventLogEntry {
  type: string
  data: string
  timestamp: string
}

const eventLog = ref<EventLogEntry[]>([])

function addEventLog(type: string, data: string) {
  const timestamp = new Date().toLocaleTimeString()
  eventLog.value.unshift({ type, data, timestamp })
  lastEvent.value = `${type}: ${data}`
}

// Event handlers
function handleFireLevelSelected(level: FireLevel) {
  selectedLevel.value = level
  addEventLog('fire-level-selected', level)
}

function handleContinue(level: FireLevel) {
  addEventLog('continue', level)
}

// Demo controls
function resetDemo() {
  selectedLevel.value = null
  isDisabled.value = false
  lastEvent.value = ''
  addEventLog('demo-reset', 'All settings reset')
}

function clearEventLog() {
  eventLog.value = []
  lastEvent.value = ''
}
</script>