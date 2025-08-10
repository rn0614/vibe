import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    ignores: ['src/shared/types/database.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ["@/shared/ui/*/*"],  // 패턴을 group으로 감싸기
            message: "UI 컴포넌트는 폴더명으로만 import하세요. 예: '@/shared/ui/Button'"
          }
        ]
      }]
    },
  },
])