import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', '.open-next/**', '.wrangler/**', 'dist/**']),
  {
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Plain <img> is intentional (see next.config.mjs).
      '@next/next/no-img-element': 'off',
    },
  },
])
