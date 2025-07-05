# セレクトボックス キー値実装ガイド

## 概要

このドキュメントでは、Konroプロジェクトで実装したセレクトボックスのキー値分離パターンについて説明します。このパターンは、ユーザーインターフェース（表示名）とデータ管理（キー値）を分離することで、保守性、国際化対応、データ整合性を向上させます。

## 実装パターン

### 1. 基本構造

#### データ型定義
```typescript
interface SelectOption {
  key: string    // データ管理用（英語）
  label: string  // 表示用（日本語）
}

interface UserInfoOption {
  ages: SelectOption[]
  genders: SelectOption[]
  occupations: SelectOption[]
}
```

#### 具体的なデータ構造
```typescript
const userInfoOptions = ref<UserInfoOption>({
  ages: [
    { key: 'teens', label: '10代' },
    { key: 'twenties', label: '20代' },
    { key: 'thirties', label: '30代' },
    { key: 'forties', label: '40代' },
    { key: 'fifties', label: '50代' },
    { key: 'sixties_plus', label: '60代以上' }
  ],
  genders: [
    { key: 'male', label: '男性' },
    { key: 'female', label: '女性' },
    { key: 'other', label: 'その他' },
    { key: 'no_answer', label: '回答しない' }
  ],
  occupations: [
    { key: 'student', label: '学生' },
    { key: 'company_employee', label: '会社員' },
    { key: 'civil_servant', label: '公務員' },
    { key: 'self_employed', label: '自営業' },
    { key: 'housewife_husband', label: '専業主婦(夫)' },
    { key: 'other', label: 'その他' }
  ]
})
```

### 2. セレクトボックス実装

#### Vueコンポーネントでの使用
```vue
<template>
  <select v-model="formData.age">
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

<script setup lang="ts">
// フォームデータはキー値で管理
const formData = reactive({
  age: '',      // 'twenties' などの英語キー
  gender: '',   // 'male' などの英語キー
  occupation: '' // 'student' などの英語キー
})
</script>
```

### 3. ヘルパー関数

#### ラベル取得関数
```typescript
function getAgeLabel(key: string): string {
  const option = userInfoOptions.value.ages.find(age => age.key === key)
  return option?.label || key
}

function getGenderLabel(key: string): string {
  const option = userInfoOptions.value.genders.find(gender => gender.key === key)
  return option?.label || key
}

function getOccupationLabel(key: string): string {
  const option = userInfoOptions.value.occupations.find(occupation => occupation.key === key)
  return option?.label || key
}
```

#### 使用例
```typescript
// データベースから取得したキー値を表示用に変換
const userAge = 'twenties'
const displayAge = getAgeLabel(userAge) // '20代'

// ユーザー情報の表示
console.log(`年代: ${getAgeLabel(userInfo.age)}`)
console.log(`性別: ${getGenderLabel(userInfo.gender)}`)
console.log(`職業: ${getOccupationLabel(userInfo.occupation)}`)
```

## データ移行パターン

### 既存データの移行

#### 移行関数の実装
```typescript
// 日本語ラベルからキー値への変換
function migrateAgeToKey(age?: string): string | undefined {
  if (!age) return undefined
  const option = userInfoOptions.value.ages.find(a => a.label === age)
  return option ? option.key : age
}

function migrateGenderToKey(gender?: string): string | undefined {
  if (!gender) return undefined
  const option = userInfoOptions.value.genders.find(g => g.label === gender)
  return option ? option.key : gender
}

function migrateOccupationToKey(occupation?: string): string | undefined {
  if (!occupation) return undefined
  const option = userInfoOptions.value.occupations.find(o => o.label === occupation)
  return option ? option.key : occupation
}
```

#### ローカルストレージからの読み込み時に移行
```typescript
function loadFromLocalStorage() {
  try {
    const savedInfo = localStorage.getItem('konro-user-info')
    
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo)
      
      // 旧形式から新形式への自動移行
      userInfo.value = {
        age: migrateAgeToKey(parsed.age),
        gender: migrateGenderToKey(parsed.gender),
        occupation: migrateOccupationToKey(parsed.occupation)
      }
    }
  } catch (error) {
    console.warn('Migration failed:', error)
  }
}
```

## テストパターン

### 1. 単体テスト

#### データ構造のテスト
```typescript
describe('UserInfoOptions', () => {
  it('should have correct structure', () => {
    const options = store.userInfoOptions
    
    expect(options.ages.some(age => 
      age.key === 'twenties' && age.label === '20代'
    )).toBe(true)
    
    expect(options.genders.some(gender => 
      gender.key === 'male' && gender.label === '男性'
    )).toBe(true)
  })
})
```

#### ヘルパー関数のテスト
```typescript
describe('Label Helper Functions', () => {
  it('should return correct labels for keys', () => {
    expect(store.getAgeLabel('twenties')).toBe('20代')
    expect(store.getGenderLabel('male')).toBe('男性')
    expect(store.getOccupationLabel('student')).toBe('学生')
  })

  it('should return key itself for unknown keys', () => {
    expect(store.getAgeLabel('unknown')).toBe('unknown')
    expect(store.getGenderLabel('unknown')).toBe('unknown')
    expect(store.getOccupationLabel('unknown')).toBe('unknown')
  })
})
```

#### フォーム操作のテスト
```typescript
describe('Form Interaction', () => {
  it('should emit submit event with key values', async () => {
    const selects = wrapper.findAll('select')
    await selects[0].setValue('twenties')  // キー値を設定
    await selects[1].setValue('male')
    await selects[2].setValue('student')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    const emittedEvents = wrapper.emitted('submit')
    expect(emittedEvents![0][0]).toEqual({
      age: 'twenties',      // キー値で送信
      gender: 'male',
      occupation: 'student'
    })
  })
})
```

### 2. E2Eテスト

#### セレクトボックスの操作テスト
```typescript
test('should select options using labels but store keys', async ({ page }) => {
  await page.goto('/setup')

  // 表示されるラベルで選択
  await page.selectOption('select >> nth=0', { label: '20代' })
  await page.selectOption('select >> nth=1', { label: '男性' })
  await page.selectOption('select >> nth=2', { label: '学生' })

  // 内部的にはキー値で保存されることを確認
  const formData = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('konro-user-info') || '{}')
  })

  expect(formData).toEqual({
    age: 'twenties',
    gender: 'male',
    occupation: 'student'
  })
})
```

## 国際化対応パターン

### 1. 多言語対応の準備

#### 言語別ラベル定義
```typescript
interface LocalizedOption {
  key: string
  labels: {
    ja: string
    en: string
    // 他の言語も追加可能
  }
}

const userInfoOptionsI18n = {
  ages: [
    { 
      key: 'twenties', 
      labels: { ja: '20代', en: '20s' }
    },
    {
      key: 'thirties',
      labels: { ja: '30代', en: '30s' }
    }
  ]
}
```

#### 現在の言語に応じたラベル取得
```typescript
function getLocalizedLabel(options: LocalizedOption[], key: string, locale: string = 'ja'): string {
  const option = options.find(opt => opt.key === key)
  return option?.labels[locale] || key
}
```

### 2. APIとの連携

#### フロントエンド（日本語表示）
```typescript
// 表示用
const displayData = {
  age: getAgeLabel(userInfo.age),        // '20代'
  gender: getGenderLabel(userInfo.gender), // '男性'
  occupation: getOccupationLabel(userInfo.occupation) // '学生'
}
```

#### バックエンド通信（英語キー）
```typescript
// API送信用
const apiData = {
  age: userInfo.age,        // 'twenties'
  gender: userInfo.gender,  // 'male'
  occupation: userInfo.occupation // 'student'
}

// API呼び出し
await fetch('/api/user-info', {
  method: 'POST',
  body: JSON.stringify(apiData)
})
```

## ベストプラクティス

### 1. キー命名規則

#### 推奨パターン
```typescript
// ✅ Good: 英語の小文字とアンダースコア
'company_employee'
'self_employed'
'no_answer'
'sixties_plus'

// ❌ Bad: 日本語やスペース
'会社員'
'company employee'
'Company-Employee'
```

#### 理由
- URLフレンドリー
- データベースカラム名として使用可能
- プログラミング言語の変数名規則に準拠

### 2. ラベル管理

#### 一元管理
```typescript
// すべてのラベルを一箇所で管理
const LABELS = {
  ages: {
    teens: '10代',
    twenties: '20代',
    thirties: '30代'
  },
  genders: {
    male: '男性',
    female: '女性',
    other: 'その他'
  }
} as const
```

#### 型安全性の確保
```typescript
type AgeKey = keyof typeof LABELS.ages
type GenderKey = keyof typeof LABELS.genders

// 型安全なヘルパー関数
function getAgeLabel(key: AgeKey): string {
  return LABELS.ages[key]
}
```

### 3. エラーハンドリング

#### 安全なフォールバック
```typescript
function getAgeLabel(key: string): string {
  const option = userInfoOptions.value.ages.find(age => age.key === key)
  
  if (!option) {
    console.warn(`Unknown age key: ${key}`)
    return key // キー自体をフォールバックとして返す
  }
  
  return option.label
}
```

#### バリデーション
```typescript
function validateUserInfo(userInfo: UserInfo): boolean {
  const validAgeKeys = userInfoOptions.value.ages.map(age => age.key)
  const validGenderKeys = userInfoOptions.value.genders.map(gender => gender.key)
  const validOccupationKeys = userInfoOptions.value.occupations.map(occ => occ.key)

  if (userInfo.age && !validAgeKeys.includes(userInfo.age)) {
    console.error(`Invalid age key: ${userInfo.age}`)
    return false
  }

  // 他のフィールドも同様にバリデーション
  return true
}
```

## まとめ

キー値分離パターンにより以下の利点を実現：

### 技術的利点
- **データ整合性**: ラベル変更がデータに影響しない
- **国際化対応**: 表示言語の切り替えが容易
- **API安定性**: バックエンドとの通信が英語で統一
- **型安全性**: TypeScriptによる厳密な型チェック

### 開発効率
- **保守性**: ラベル変更が一箇所で完結
- **テスト容易性**: 予測可能なキー値でテスト作成
- **デバッグ性**: 英語キーによる問題特定の容易さ

### ユーザー体験
- **一貫性**: 日本語表示の統一
- **アクセシビリティ**: 適切なラベル提供
- **パフォーマンス**: 効率的なデータ管理

このパターンは、スケーラブルで保守性の高いWebアプリケーション開発において非常に有効なアプローチです。