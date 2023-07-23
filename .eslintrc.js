module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['standard', 'prettier'],
  overrides: [
    {
      files: ['.eslintrc.{js, cjs}'],
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-var': ['error'],
  },
}
