// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    settings: {
      'import/core-modules': [
        '@shopify/flash-list',
        'react-native-draggable-flatlist',
      ],
    },
  },
  {
    files: ['app/**/*.{ts,tsx,js,jsx}', 'components/**/*.{ts,tsx,js,jsx}', 'hooks/**/*.{ts,tsx,js,jsx}', 'stores/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/storage', '@/lib/storage/*', '**/lib/storage/**'],
              message: 'UI and State layers must use Feature APIs instead of importing Storage directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['lib/storage/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app',
                '@/app/*',
                '@/components',
                '@/components/*',
                '@/hooks',
                '@/hooks/*',
                '@/stores',
                '@/stores/*',
                '@/lib/features',
                '@/lib/features/*',
                '**/app/**',
                '**/components/**',
                '**/hooks/**',
                '**/stores/**',
                '**/lib/features/**',
              ],
              message: 'Storage layer must not depend on UI, State, or Feature layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['lib/algorithms/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              message: 'Algorithms layer must stay pure and cannot depend on React Native APIs.',
            },
            {
              name: 'expo',
              message: 'Algorithms layer must stay pure and cannot depend on Expo runtime APIs.',
            },
            {
              name: 'expo-sqlite',
              message: 'Algorithms layer must stay pure and cannot depend on storage/IO APIs.',
            },
            {
              name: 'fs',
              message: 'Algorithms layer must stay pure and cannot depend on Node IO APIs.',
            },
            {
              name: 'fs/promises',
              message: 'Algorithms layer must stay pure and cannot depend on Node IO APIs.',
            },
            {
              name: 'path',
              message: 'Algorithms layer must stay pure and cannot depend on platform APIs.',
            },
          ],
          patterns: [
            {
              group: ['@/lib/storage', '@/lib/storage/*', '@/lib/features', '@/lib/features/*', '@/lib/scheduler', '@/lib/scheduler/*'],
              message: 'Algorithms layer must remain reusable and independent from higher layers.',
            },
            {
              group: ['expo-*', '@react-native*', '**/lib/storage/**', '**/lib/features/**', '**/lib/scheduler/**'],
              message: 'Algorithms layer must remain pure and independent from runtime/storage layers.',
            },
          ],
        },
      ],
    },
  },
]);
