module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'eslint-config-prettier'],
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // Keep adapters isolated (optional safety):
    // 'no-restricted-imports': ['error', { patterns: ['src/adapters/*/../*'] }]
  }
}
