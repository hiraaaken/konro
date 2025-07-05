# Issue #9: ユーザーオンボーディング機能開発ログ

## 概要

Issue #9では、Konroアプリケーションのユーザーオンボーディング機能の実装を行いました。これにより、初回ユーザーが適切な情報入力フローを経てアプリを利用できるようになりました。

**実装期間**: 2025年7月5日  
**開発者**: Claude  
**関連Issue**: #9  
**関連PR**: 未作成（開発中）

## 実装内容

### 1. ユーザーオンボーディングフロー

#### 1.1 新しいウェルカム画面 (`pages/index.vue`)

**Before**: 簡素なデモ用ランディングページ
```vue
<!-- シンプルなデモリンクのみ -->
<NuxtLink to="/demo">View Demo</NuxtLink>
```

**After**: プロフェッショナルなウェルカム画面
```vue
<!-- 火をテーマにした美しいUI -->
<div class="bg-white rounded-lg shadow-lg p-8">
  <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-4">
    <Icon name="flame" size="40" class="text-white" />
  </div>
  <h1 class="text-4xl font-bold text-gray-800 mb-2">Konro</h1>
  <Button @click="startApp">始める</Button>
</div>
```

**改善点**:
- 火をテーマにしたビジュアルデザイン
- 適切なユーザーフロー管理
- ローディング状態の追加
- デバッグ機能（ストレージクリア）の追加

#### 1.2 スマートルーティング機能

**実装機能**:
```typescript
function startApp() {
  if (userInfoStore.shouldShowUserInfoForm()) {
    router.push('/setup')  // 初回ユーザー
  } else {
    router.push('/select') // 既存ユーザー
  }
}
```

**フロー**:
```
初回訪問: / → "始める" → /setup → (情報入力/スキップ) → /select → /chat
再訪問:   / → "始める" → /select (設定をスキップ)
```

#### 1.3 ミドルウェアによる保護 (`middleware/auth.global.ts`)

**Before**: 基本的なセッション保護のみ
```typescript
case '/select':
  // Fire level selection is accessible after setup (or skip)
  break
```

**After**: オンボーディング状態を考慮した保護
```typescript
case '/select':
  if (userInfoStore.shouldShowUserInfoForm()) {
    return navigateTo('/setup')  // 未完了の場合は設定画面へ
  }
  break
```

### 2. ユーザー情報セレクトボックスの改善

#### 2.1 データ構造の改善

**Before**: 日本語ラベルのみの配列
```typescript
const userInfoOptions = {
  ages: ['10代', '20代', '30代', '40代', '50代', '60代以上'],
  genders: ['男性', '女性', 'その他', '回答しない'],
  occupations: ['学生', '会社員', '公務員', '自営業', '専業主婦(夫)', 'その他']
}
```

**After**: キー値と表示名を分離した構造
```typescript
interface SelectOption {
  key: string
  label: string
}

const userInfoOptions = {
  ages: [
    { key: 'teens', label: '10代' },
    { key: 'twenties', label: '20代' },
    { key: 'thirties', label: '30代' },
    // ...
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
    // ...
  ]
}
```

#### 2.2 キー値マッピング表

| カテゴリ | キー | 表示名 |
|---------|------|--------|
| **年代** | | |
| | `teens` | 10代 |
| | `twenties` | 20代 |
| | `thirties` | 30代 |
| | `forties` | 40代 |
| | `fifties` | 50代 |
| | `sixties_plus` | 60代以上 |
| **性別** | | |
| | `male` | 男性 |
| | `female` | 女性 |
| | `other` | その他 |
| | `no_answer` | 回答しない |
| **職業** | | |
| | `student` | 学生 |
| | `company_employee` | 会社員 |
| | `civil_servant` | 公務員 |
| | `self_employed` | 自営業 |
| | `housewife_husband` | 専業主婦(夫) |
| | `other` | その他 |

#### 2.3 ヘルパー関数の追加

```typescript
// ラベル取得関数
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

#### 2.4 データ移行機能

既存の日本語データを新しいキー値形式に自動変換：

```typescript
function migrateAgeToKey(age?: string): string | undefined {
  if (!age) return undefined
  const option = userInfoOptions.value.ages.find(a => a.label === age)
  return option ? option.key : age
}
```

### 3. UserInfoFormコンポーネントの改善

#### 3.1 セレクトボックスの更新

**Before**:
```vue
<option
  v-for="age in userInfoOptions.ages"
  :key="age"
  :value="age"
>
  {{ age }}
</option>
```

**After**:
```vue
<option
  v-for="age in userInfoOptions.ages"
  :key="age.key"
  :value="age.key"
>
  {{ age.label }}
</option>
```

#### 3.2 イベントハンドリングの修正

**Before**: 異なるイベント名
```typescript
// コンポーネント
emit('saved')
emit('skipped')

// 親コンポーネント
@submit="handleSubmit"
@skip="handleSkip"
```

**After**: 統一されたイベント名
```typescript
// コンポーネント
emit('submit', userInfoData)
emit('skip')

// 親コンポーネント
@submit="handleSubmit"
@skip="handleSkip"
```

#### 3.3 プログレス表示の改善

設定済み情報を日本語ラベルで表示：
```vue
<div v-if="hasUserInfo" class="space-y-2">
  <Badge variant="success" icon="check">設定済み</Badge>
  <div class="text-xs text-gray-500">
    <p v-if="userInfo.age">年代: {{ userInfoStore.getAgeLabel(userInfo.age) }}</p>
    <p v-if="userInfo.gender">性別: {{ userInfoStore.getGenderLabel(userInfo.gender) }}</p>
    <p v-if="userInfo.occupation">職業: {{ userInfoStore.getOccupationLabel(userInfo.occupation) }}</p>
  </div>
</div>
```

## テスト戦略

### 1. 単体テストの更新

#### 1.1 UserInfoStore テスト（18テスト）
- 新しいデータ構造のテスト
- ヘルパー関数のテスト
- データ移行機能のテスト

```typescript
it('should_have_correct_user_info_options', () => {
  const options = store.userInfoOptions
  
  expect(options.ages.some(age => age.key === 'twenties' && age.label === '20代')).toBe(true)
  expect(options.genders.some(gender => gender.key === 'male' && gender.label === '男性')).toBe(true)
  expect(options.occupations.some(occupation => occupation.key === 'company_employee' && occupation.label === '会社員')).toBe(true)
})

it('should_return_correct_labels_for_keys', () => {
  expect(store.getAgeLabel('twenties')).toBe('20代')
  expect(store.getGenderLabel('male')).toBe('男性')
  expect(store.getOccupationLabel('student')).toBe('学生')
})
```

#### 1.2 UserInfoForm テスト（16テスト）
- 新しいイベントハンドリングのテスト
- キー値を使ったフォーム操作のテスト

```typescript
it('should emit submit event with user data when form is submitted', async () => {
  const selects = wrapper.findAll('select')
  await selects[0].setValue('twenties')  // age
  await selects[1].setValue('male')      // gender  
  await selects[2].setValue('student')   // occupation

  const form = wrapper.find('form')
  await form.trigger('submit.prevent')

  const emittedEvents = wrapper.emitted('submit')
  expect(emittedEvents![0][0]).toEqual({
    age: 'twenties',
    gender: 'male',
    occupation: 'student'
  })
})
```

### 2. E2Eテストの作成

オンボーディングフロー全体のテスト：
```typescript
test('should complete user info setup flow', async ({ page }) => {
  await page.goto('/setup')

  await page.selectOption('select >> nth=0', 'twenties')  // Age
  await page.selectOption('select >> nth=1', 'male')      // Gender  
  await page.selectOption('select >> nth=2', 'student')   // Occupation

  await page.click('button:has-text("保存")')

  await expect(page).toHaveURL('/select')
})
```

## 技術的な利点

### 1. 国際化対応
- キー値でデータ管理することで、将来的な多言語対応が容易
- 表示は言語別に切り替え可能
- APIとの通信は英語キーで統一

### 2. データ整合性
- ラベルが変更されてもデータベースの値は変わらない
- 日本語表記のゆらぎに影響されない
- バックエンドとの連携が安定

### 3. 後方互換性
- 既存データを自動的に新形式に移行
- ユーザーが気づかずにアップグレード
- データロスなし

### 4. 保守性
- 表示名の変更が容易
- 新しいオプションの追加が簡単
- テストコードの安定性向上

## 解決した問題

### 1. ユーザー情報入力画面が表示されない問題

**原因**:
- `nextTick`のimport漏れ
- ストア初期化のタイミング問題
- 既存データの影響

**解決策**:
- 必要なimportの追加
- デバッグログの追加
- ストレージクリア機能の実装
- ローカルストレージの適切な初期化

### 2. セレクトボックスのデータ管理問題

**課題**:
- 日本語ラベルでデータ管理していた
- 国際化対応が困難
- データの整合性に問題

**解決策**:
- キー値と表示名の分離
- ヘルパー関数による適切な表示
- データ移行機能の実装

## 開発プロセス

### 1. TDDアプローチ
1. **Red**: 失敗するテストを作成
2. **Green**: テストを通すための最小限の実装
3. **Refactor**: コードの改善とリファクタリング

### 2. 段階的実装
1. **分析**: 既存コードの問題点特定
2. **設計**: 新しいデータ構造の設計
3. **実装**: コンポーネントとストアの更新
4. **テスト**: 包括的なテストカバレッジ
5. **統合**: 全体フローの確認

### 3. 品質保証
- **単体テスト**: 34テスト（すべて通過）
- **型チェック**: TypeScript strict mode
- **コードスタイル**: ESLint準拠
- **E2Eテスト**: 主要フローの確認

## 今後の改善点

### 1. 機能拡張
- [ ] ユーザー情報の編集機能
- [ ] 詳細なバリデーション
- [ ] カスタムオプションの追加
- [ ] プロフィール画像のアップロード

### 2. UX改善
- [ ] より直感的なフォームデザイン
- [ ] アニメーション効果の追加
- [ ] ツールチップやヘルプテキスト
- [ ] キーボードナビゲーションの改善

### 3. 技術的改善
- [ ] パフォーマンス最適化
- [ ] アクセシビリティの向上
- [ ] SEO対応
- [ ] PWA機能の追加

## まとめ

Issue #9では、ユーザーオンボーディング機能の完全な実装と、ユーザー情報セレクトボックスの大幅な改善を行いました。これにより：

- **ユーザー体験の向上**: スムーズなオンボーディングフロー
- **データ管理の改善**: キー値による安定したデータ管理
- **開発効率の向上**: 型安全性と保守性の改善
- **将来への対応**: 国際化や機能拡張への基盤構築

すべての変更は包括的なテストでカバーされており、品質と安定性を確保しています。