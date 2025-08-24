/**
 * Jest configuration migrated from package.json and updated for latest Jest.
 * Using jsdom environment for React component tests.
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js', '@testing-library/jest-dom'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest'],
  },
  testMatch: ['<rootDir>/src/**/?(*.)+(test).[tj]s?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/index.{ts,tsx,js,jsx}', '!**/*.d.ts'],
}
