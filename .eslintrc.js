module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
    jasmine: true,
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
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-var': ['error'],
    'dot-notation': ['off'],
  },
}
