import nextPlugin from '@next/eslint-plugin-next';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('prettier'), // 添加 Prettier，关闭与格式化冲突的规则
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'error',
      '@next/next/no-img-element': 'error',
    },
  },
];