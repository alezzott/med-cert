import vue from 'eslint-plugin-vue';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: {
      vue,
      prettier,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'prettier/prettier': 'error',
    },
  },
];