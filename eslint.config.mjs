import jest from 'eslint-plugin-jest'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import js from '@eslint/js'
import {FlatCompat} from '@eslint/eslintrc'
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const languageOptions = {
  globals: {
    ...globals.node,
    ...jest.environments.globals.globals,
    ...globals.jasmine,
    ...globals.jest,
  },
  ecmaVersion: 9,
  sourceType: 'module',
  parser: tsParser,
  parserOptions: {
    project: './tsconfig.json',
  },
}

const customTypescriptConfig = {
  plugins: {jest, '@typescript-eslint': typescriptEslint},
  languageOptions,
  rules: {
    'i18n-text/no-en': 'off',
    'eslint-comments/no-use': 'off',
    'import/no-namespace': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',

    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public',
      },
    ],

    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',
    camelcase: 'off',
    '@typescript-eslint/consistent-type-assertions': 'error',

    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],

    'filenames/match-regex': 'off',
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-extraneous-class': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'off',
  },
}

export default [
  {
    ignores: [
      '**/dist/',
      '**/node_modules/',
      '**/jest.config.js',
      '**/lib/',
      '**/coverage/',
    ],
  },
  customTypescriptConfig,
  tseslint.config(
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
  )
]
