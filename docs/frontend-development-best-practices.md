# フロントエンド開発ベストプラクティス

## 概要

このドキュメントでは、Konroプロジェクトの開発を通じて確立されたフロントエンド開発のベストプラクティスをまとめています。Vue 3 + Nuxt.js + TypeScript + Tailwind CSS + Pinia の技術スタックを使用した実際の開発経験に基づいています。

## 1. プロジェクト構造と命名規則

### 1.1 ディレクトリ構造

```
konro-frontend/
├── components/           # UIコンポーネント
│   ├── ui/              # 基本UIコンポーネント
│   ├── user/            # ユーザー関連コンポーネント
│   ├── fire-level/      # 火力選択関連コンポーネント
│   └── chat/            # チャット関連コンポーネント
├── pages/               # ページコンポーネント
├── stores/              # Pinia ストア
├── types/               # 型定義
│   ├── domain/          # ドメイン型
│   └── api/             # API型
├── composables/         # コンポーザブル関数
├── middleware/          # ミドルウェア
├── tests/               # テストファイル
│   ├── unit/            # 単体テスト
│   └── e2e/             # E2Eテスト
└── docs/                # ドキュメント
```

### 1.2 命名規則

#### ファイル・ディレクトリ名
```
✅ Good
components/user/UserInfoForm.vue
stores/userInfo.ts
types/domain/index.ts

❌ Bad  
components/user/user-info-form.vue
stores/user_info.ts
types/domainTypes.ts
```

#### 変数・関数名
```typescript
// ✅ Good: キャメルケース
const userInfoStore = useUserInfoStore()
const handleSubmit = () => {}
const isLoading = ref(false)

// ❌ Bad: スネークケース、PascalCase
const user_info_store = useUserInfoStore()
const HandleSubmit = () => {}
const is_loading = ref(false)
```

#### 型名
```typescript
// ✅ Good: PascalCase
interface UserInfo {}
type FireLevel = 'weak' | 'medium' | 'strong'

// ❌ Bad: キャメルケース
interface userInfo {}
type fireLevel = 'weak' | 'medium' | 'strong'
```

## 2. コンポーネント設計

### 2.1 Composition API の活用

#### 推奨パターン
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// Props定義
interface Props {
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false
})

// Emits定義
interface Emits {
  (e: 'submit', data: UserInfo): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// Reactive state
const formData = reactive({
  name: '',
  email: ''
})

// Store使用
const userStore = useUserStore()
const { user, isLoading } = storeToRefs(userStore)

// Computed
const isValid = computed(() => {
  return formData.name.length > 0 && formData.email.length > 0
})

// Methods
function handleSubmit() {
  if (isValid.value) {
    emit('submit', formData)
  }
}

// Lifecycle
onMounted(() => {
  // 初期化処理
})
</script>
```

#### 避けるべきパターン
```vue
<!-- ❌ Bad: Options API の混在 -->
<script>
export default {
  data() {
    return {
      name: ''
    }
  },
  methods: {
    handleSubmit() {}
  }
}
</script>

<script setup lang="ts">
// Composition API
const age = ref(0)
</script>
```

### 2.2 Props と Emits の型安全性

#### 推奨パターン
```typescript
// 明確なインターフェース定義
interface Props {
  user: UserInfo
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

interface Emits {
  (e: 'update', user: UserInfo): void
  (e: 'delete', id: string): void
}

// デフォルト値の明示
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: 'md'
})
```

#### 避けるべきパターン
```typescript
// ❌ Bad: 型が曖昧
const props = defineProps(['user', 'loading'])

// ❌ Bad: any型の使用
interface Props {
  data: any
  callback: any
}
```

### 2.3 コンポーネントの責務分離

#### 推奨：小さな責務に分割
```vue
<!-- UserInfoForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <UserInfoAgeSelect v-model="formData.age" />
    <UserInfoGenderSelect v-model="formData.gender" />
    <UserInfoOccupationSelect v-model="formData.occupation" />
    <FormActions @submit="handleSubmit" @cancel="handleCancel" />
  </form>
</template>
```

#### 避けるべき：大きな単一コンポーネント
```vue
<!-- ❌ Bad: すべてを一つのコンポーネントに -->
<template>
  <div>
    <!-- 200行のフォーム要素 -->
    <!-- 複数の責務が混在 -->
  </div>
</template>
```

## 3. 状態管理（Pinia）

### 3.1 ストア設計

#### 推奨パターン
```typescript
// stores/userInfo.ts
export const useUserInfoStore = defineStore('userInfo', () => {
  // State
  const userInfo = ref<UserInfo>({})
  const isLoading = ref(false)
  
  // Getters (computed)
  const hasUserInfo = computed(() => {
    return !!(userInfo.value.age || userInfo.value.gender || userInfo.value.occupation)
  })
  
  // Actions
  function setUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
    saveToLocalStorage()
  }
  
  function loadFromLocalStorage() {
    // 実装
  }
  
  // Private methods
  function saveToLocalStorage() {
    // 実装
  }
  
  return {
    // State
    userInfo,
    isLoading,
    
    // Getters
    hasUserInfo,
    
    // Actions
    setUserInfo,
    loadFromLocalStorage
  }
})
```

#### コンポーネントでの使用
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

const userInfoStore = useUserInfoStore()

// リアクティブな参照
const { userInfo, isLoading, hasUserInfo } = storeToRefs(userInfoStore)

// アクション
const { setUserInfo, loadFromLocalStorage } = userInfoStore
</script>
```

### 3.2 ストア分割の指針

#### 推奨：機能別分割
```
stores/
├── userInfo.ts      # ユーザー情報
├── fireLevel.ts     # 火力選択
├── chatSession.ts   # チャットセッション
└── settings.ts      # アプリ設定
```

#### 避けるべき：巨大な単一ストア
```typescript
// ❌ Bad: すべてを一つのストアに
export const useAppStore = defineStore('app', () => {
  const user = ref()
  const chat = ref()
  const settings = ref()
  const ui = ref()
  // 100以上のプロパティとメソッド...
})
```

## 4. 型定義とデータ管理

### 4.1 ドメイン型の定義

#### 推奨パターン
```typescript
// types/domain/index.ts

// 基本型
export type FireLevel = 'weak' | 'medium' | 'strong'

// インターフェース
export interface UserInfo {
  age?: string
  gender?: string
  occupation?: string
}

// 選択肢型
export interface SelectOption {
  key: string
  label: string
}

// ユニオン型
export type MessageSender = 'user' | 'bot'

// 条件付き型
export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}
```

### 4.2 キー値分離パターン

#### データ管理の推奨パターン
```typescript
// 内部管理：英語キー
const userInfo = {
  age: 'twenties',
  gender: 'male',
  occupation: 'student'
}

// 表示：日本語ラベル
const userInfoOptions = {
  ages: [
    { key: 'twenties', label: '20代' },
    { key: 'thirties', label: '30代' }
  ]
}

// 変換関数
function getAgeLabel(key: string): string {
  const option = userInfoOptions.ages.find(age => age.key === key)
  return option?.label || key
}
```

## 5. テスト戦略

### 5.1 単体テスト

#### コンポーネントテスト
```typescript
// tests/unit/UserInfoForm.test.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserInfoForm from '@/components/user/UserInfoForm.vue'

describe('UserInfoForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should emit submit event with correct data', async () => {
    const wrapper = mount(UserInfoForm)
    
    // フォーム入力
    await wrapper.find('select[name="age"]').setValue('twenties')
    await wrapper.find('select[name="gender"]').setValue('male')
    
    // フォーム送信
    await wrapper.find('form').trigger('submit.prevent')
    
    // イベント確認
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0][0]).toEqual({
      age: 'twenties',
      gender: 'male',
      occupation: undefined
    })
  })
})
```

#### ストアテスト
```typescript
// tests/unit/stores/userInfo.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { useUserInfoStore } from '@/stores/userInfo'

describe('useUserInfoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should update user info correctly', () => {
    const store = useUserInfoStore()
    
    store.setUserInfo({
      age: 'twenties',
      gender: 'male'
    })
    
    expect(store.userInfo.age).toBe('twenties')
    expect(store.userInfo.gender).toBe('male')
    expect(store.hasUserInfo).toBe(true)
  })
})
```

### 5.2 E2Eテスト

#### ユーザーフローテスト
```typescript
// tests/e2e/user-onboarding.spec.ts
import { test, expect } from '@playwright/test'

test('should complete user onboarding flow', async ({ page }) => {
  // ホーム画面
  await page.goto('/')
  await page.click('button:has-text("始める")')
  
  // 設定画面
  await expect(page).toHaveURL('/setup')
  await page.selectOption('select[name="age"]', 'twenties')
  await page.selectOption('select[name="gender"]', 'male')
  await page.click('button:has-text("保存")')
  
  // 火力選択画面
  await expect(page).toHaveURL('/select')
  await expect(page.locator('text=今日の励まし火力を選んでください')).toBeVisible()
})
```

### 5.3 テスト命名規則

#### 推奨パターン
```typescript
describe('UserInfoForm', () => {
  describe('Rendering', () => {
    it('should render form fields correctly', () => {})
    it('should show loading state when loading prop is true', () => {})
  })
  
  describe('User Interaction', () => {
    it('should emit submit event when form is submitted', () => {})
    it('should validate form data before submission', () => {})
  })
  
  describe('Store Integration', () => {
    it('should call store methods when user submits form', () => {})
  })
})
```

## 6. エラーハンドリング

### 6.1 グローバルエラーハンドリング

#### エラー境界の設定
```vue
<!-- app.vue -->
<template>
  <div>
    <ErrorBoundary>
      <NuxtPage />
    </ErrorBoundary>
  </div>
</template>
```

#### エラーストアの実装
```typescript
// stores/error.ts
export const useErrorStore = defineStore('error', () => {
  const errors = ref<Error[]>([])
  
  function addError(error: Error) {
    errors.value.push(error)
    console.error('Application Error:', error)
  }
  
  function clearErrors() {
    errors.value = []
  }
  
  return { errors, addError, clearErrors }
})
```

### 6.2 API エラーハンドリング

#### 統一されたAPIクライアント
```typescript
// services/api/client.ts
class ApiClient {
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      
      if (!response.ok) {
        throw new ApiError(response.status, response.statusText)
      }
      
      return await response.json()
    } catch (error) {
      // エラーログ記録
      const errorStore = useErrorStore()
      errorStore.addError(error as Error)
      
      throw error
    }
  }
}
```

## 7. パフォーマンス最適化

### 7.1 コンポーネントの最適化

#### 遅延ローディング
```vue
<script setup lang="ts">
// 重いコンポーネントの遅延読み込み
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
</script>
```

#### メモ化
```vue
<script setup lang="ts">
const expensiveComputed = computed(() => {
  // 重い計算処理
  return heavyCalculation(props.data)
})

// watchの最適化
watchEffect(() => {
  if (props.trigger) {
    performAction()
  }
}, { flush: 'post' })
</script>
```

### 7.2 バンドルサイズの最適化

#### Tree Shakingの活用
```typescript
// ✅ Good: 必要な関数のみインポート
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

// ❌ Bad: 全体のインポート
import * as Vue from 'vue'
import * as Pinia from 'pinia'
```

## 8. アクセシビリティ

### 8.1 セマンティックHTML

#### 推奨パターン
```vue
<template>
  <form role="form" aria-label="ユーザー情報入力">
    <fieldset>
      <legend>基本情報</legend>
      
      <label for="age">年代</label>
      <select 
        id="age" 
        v-model="formData.age"
        aria-describedby="age-help"
        required
      >
        <option value="">選択してください</option>
        <option value="twenties">20代</option>
      </select>
      <div id="age-help" class="help-text">
        あなたの年代を選択してください
      </div>
    </fieldset>
    
    <button type="submit" :disabled="!isValid">
      送信
    </button>
  </form>
</template>
```

### 8.2 キーボードナビゲーション

#### フォーカス管理
```vue
<script setup lang="ts">
const firstInput = ref<HTMLElement>()

onMounted(() => {
  // フォーカスの初期設定
  firstInput.value?.focus()
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleCancel()
  }
}
</script>
```

## 9. 開発ワークフロー

### 9.1 Git ワークフロー

#### ブランチ戦略
```
main (本番)
├── develop (開発統合)
    ├── feature/issue-9 (機能開発)
    ├── bugfix/issue-12 (バグ修正)
    └── hotfix/issue-15 (緊急修正)
```

#### コミットメッセージ
```
feat: Add user onboarding flow with form validation

- Implement UserInfoForm component with validation
- Add user info store with localStorage integration  
- Update routing middleware for onboarding protection
- Add comprehensive test coverage (34 tests)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 9.2 開発環境の最適化

#### 開発サーバーの設定
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // 開発時のパフォーマンス最適化
  vite: {
    optimizeDeps: {
      include: ['vue', 'pinia']
    }
  },
  
  // TypeScript設定
  typescript: {
    strict: true,
    typeCheck: true
  }
})
```

## 10. まとめ

これらのベストプラクティスにより以下を実現：

### 開発効率の向上
- **型安全性**: TypeScriptによる早期エラー検出
- **一貫性**: 統一されたコーディング規則
- **保守性**: 明確な責務分離と構造化

### 品質の確保
- **テストカバレッジ**: 包括的なテスト戦略
- **エラーハンドリング**: 堅牢なエラー処理
- **パフォーマンス**: 最適化された実装

### ユーザー体験の向上
- **アクセシビリティ**: 誰でも使いやすいUI
- **レスポンシブ**: 様々なデバイスへの対応
- **パフォーマンス**: 高速なページ読み込み

これらのプラクティスは、スケーラブルで保守性の高いフロントエンドアプリケーション開発の基盤となります。