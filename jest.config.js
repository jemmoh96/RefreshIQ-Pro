/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  setupFiles:                ['jest-chrome'],
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$':           '<rootDir>/src/$1',
    '^@shared/(.*)$':     '<rootDir>/src/shared/$1',
    '^@store/(.*)$':      '<rootDir>/src/store/$1',
    '^@components/(.*)$': '<rootDir>/src/popup/components/$1',
    '\\.css$':            'identity-obj-proxy',
  },
  testMatch: ['**/tests/**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
