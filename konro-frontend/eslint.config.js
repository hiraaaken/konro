import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    ignores: [
      '.nuxt/**',
      'dist/**',
      'node_modules/**',
      '*.d.ts',
      '**/*.d.ts',
      '.output/**'
    ]
  },
  {
    files: ['**/*.vue', '**/*.ts', '**/*.js'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        // Browser environment
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Node.js environment
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        // Vue/Nuxt globals
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        defineOptions: 'readonly',
        defineNuxtPlugin: 'readonly',
        useUserInfoStore: 'readonly',
        useFireLevelStore: 'readonly',
        useChatSessionStore: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        FocusEvent: 'readonly',
        RequestInit: 'readonly',
        HeadersInit: 'readonly',
        fetch: 'readonly',
        location: 'readonly',
        // Vue internals
        $slots: 'readonly',
        // Test globals (will be overridden in test files)
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly'
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': typescript
    },
    rules: {
      // Vue 3 Composition API specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/component-api-style': ['error', ['script-setup', 'composition']],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits', 'defineExpose', 'defineSlots', 'defineModel']
      }],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/no-v-html': 'error',
      'vue/require-v-for-key': 'error',
      'vue/no-unused-vars': 'error',
      'vue/no-template-shadow': 'error',
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        }
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/prop-name-casing': ['error', 'camelCase'],

      // TypeScript specific rules (only non-type-checking rules)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // General JavaScript rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': 'error',
      'curly': 'error',
      'no-duplicate-imports': 'error',
      'no-return-await': 'error',

      // Pinia store specific rules
      'vue/no-ref-as-operand': 'error'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]