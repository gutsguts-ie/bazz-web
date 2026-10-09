import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig, globalIgnores } from 'eslint/config'

// eslint-config-next 15 ships legacy (eslintrc) configs; FlatCompat adapts them.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default defineConfig([
  ...compat.extends('next/core-web-vitals'),
  globalIgnores(['.next/**', '.amplify-hosting/**', '.netlify/**', 'dist/**']),
  {
    // Flat config only matches .js/.mjs/.cjs by default.
    files: ['**/*.{js,jsx,mjs}'],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Plain <img> is intentional (see next.config.mjs).
      '@next/next/no-img-element': 'off',
    },
  },
])
