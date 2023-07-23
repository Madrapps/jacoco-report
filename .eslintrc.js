module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['prettier'],
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
    indent: ['error', 2],
  },
}
