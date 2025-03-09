module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    'no-duplicate-imports': 'error',
    'no-template-curly-in-string': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'error',
    'curly': 'error',
    'eqeqeq': 'error',
    'no-empty-function': 'warn',
    'no-eval': 'error',
    'no-return-assign': 'error',
    'no-param-reassign': 'warn',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
  },
}; 