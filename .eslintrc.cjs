/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'tailwindcss'],
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended', 'eslint-config-prettier'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'off'
  }
};


