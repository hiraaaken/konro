<template>
  <div class="min-h-screen bg-konro-dark flex items-center justify-center p-4">
    <div class="max-w-md mx-auto text-center">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-konro-primary mb-4">
          🔥 Konro
        </h1>
        <p class="text-konro-secondary mb-6">
          ポジティブ励ましチャットボット
        </p>
        <p class="text-sm text-konro-secondary mb-8">
          Fire Level Selector Component Demo
        </p>
        
        <NuxtLink 
          to="/demo"
          class="inline-block px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-lg
                 hover:from-orange-500 hover:to-red-600 transform hover:scale-105 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          View Demo
        </NuxtLink>
        
        <div class="mt-8 pt-6 border-t border-gray-700">
          <p class="text-xs text-konro-secondary">
            Feature Branch: feature_8<br>
            Fire Level Selector Component Implementation
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Konro - Fire Level Selector Demo'
})
</script>