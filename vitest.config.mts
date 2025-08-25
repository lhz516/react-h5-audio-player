/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['src/**/index.{ts,tsx,js,jsx}', '**/*.d.ts'],
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
})
