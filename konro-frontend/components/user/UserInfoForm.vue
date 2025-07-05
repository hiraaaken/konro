<template>
  <div
    class="user-info-form max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
    :data-testid="'user-info-form'"
  >
    <!-- Header -->
    <div class="text-center mb-6">
      <Icon
        name="user"
        size="xl"
        color="primary"
        class="mb-2"
      />
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        プロフィール設定
      </h2>
      <p class="text-gray-600">
        より良い励ましを提供するために、簡単な情報を教えてください
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit">
      <!-- Age Selection -->
      <FormField
        v-model="formData.age"
        label="年代"
        :required="false"
        help-text="あなたの年代を選択してください"
      >
        <template #input>
          <select
            v-model="formData.age"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">選択してください</option>
            <option
              v-for="age in userInfoOptions.ages"
              :key="age.key"
              :value="age.key"
            >
              {{ age.label }}
            </option>
          </select>
        </template>
      </FormField>

      <!-- Gender Selection -->
      <FormField
        v-model="formData.gender"
        label="性別"
        :required="false"
        help-text="該当するものを選択してください"
        class="mt-4"
      >
        <template #input>
          <select
            v-model="formData.gender"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">選択してください</option>
            <option
              v-for="gender in userInfoOptions.genders"
              :key="gender.key"
              :value="gender.key"
            >
              {{ gender.label }}
            </option>
          </select>
        </template>
      </FormField>

      <!-- Occupation Selection -->
      <FormField
        v-model="formData.occupation"
        label="職業"
        :required="false"
        help-text="現在の職業を選択してください"
        class="mt-4"
      >
        <template #input>
          <select
            v-model="formData.occupation"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">選択してください</option>
            <option
              v-for="occupation in userInfoOptions.occupations"
              :key="occupation.key"
              :value="occupation.key"
            >
              {{ occupation.label }}
            </option>
          </select>
        </template>
      </FormField>

      <!-- Actions -->
      <div class="flex space-x-3 mt-6">
        <Button
          type="submit"
          variant="primary"
          :full-width="false"
          :loading="props.loading"
          class="flex-1"
        >
          保存
        </Button>
        <Button
          type="button"
          variant="ghost"
          :full-width="false"
          :disabled="props.loading"
          class="flex-1"
          @click="handleSkip"
        >
          後で設定
        </Button>
      </div>
    </form>

    <!-- Progress Indicator -->
    <div class="mt-4 text-center">
      <div v-if="hasUserInfo" class="space-y-2">
        <Badge
          variant="success"
          icon="check"
        >
          設定済み
        </Badge>
        <div class="text-xs text-gray-500">
          <p v-if="userInfo.age">年代: {{ userInfoStore.getAgeLabel(userInfo.age) }}</p>
          <p v-if="userInfo.gender">性別: {{ userInfoStore.getGenderLabel(userInfo.gender) }}</p>
          <p v-if="userInfo.occupation">職業: {{ userInfoStore.getOccupationLabel(userInfo.occupation) }}</p>
        </div>
      </div>
      <Badge
        v-else-if="isPartiallyFilled"
        variant="warning"
        icon="info"
      >
        一部入力済み
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserInfoStore } from '../../stores/userInfo'
import FormField from '../ui/FormField.vue'
import Button from '../ui/Button.vue'
import Icon from '../ui/Icon.vue'
import Badge from '../ui/Badge.vue'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', userInfo: any): void
  (e: 'skip'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Store
const userInfoStore = useUserInfoStore()

// Reactive data from store
const { userInfo, userInfoOptions, hasUserInfo } = storeToRefs(userInfoStore)

// Form data
const formData = reactive({
  age: userInfo.value.age || '',
  gender: userInfo.value.gender || '',
  occupation: userInfo.value.occupation || ''
})

// Computed properties
const isPartiallyFilled = computed(() => {
  return !!(formData.age || formData.gender || formData.occupation) && !hasUserInfo.value
})

// Methods
function handleSubmit() {
  const userInfoData = {
    age: formData.age || undefined,
    gender: formData.gender || undefined,
    occupation: formData.occupation || undefined
  }
  
  userInfoStore.setUserInfo(userInfoData)
  emit('submit', userInfoData)
}

function handleSkip() {
  userInfoStore.skipUserInfo()
  emit('skip')
}
</script>