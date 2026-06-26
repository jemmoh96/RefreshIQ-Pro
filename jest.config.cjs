/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        jsx: 'react-jsx',
        module: 'CommonJS',
        moduleResolution: 'node',
        baseUrl: '.',
        paths: {
          '@/*':           ['src/*'],
          '@shared/*':     ['src/shared/*'],
          '@store/*':      ['src/store/*'],
          '@components/*': ['src/popup/components/*'],
        },
      },
    }],
  },
  setupFiles:                ['jest-chrome'],
  setupFilesAfterFramework:  undefined,
  moduleNameMapper: {
    '^@/(.*)$':           '<rootDir>/src/$1',
    '^@shared/(.*)$':     '<rootDir>/src/shared/$1',
    '^@store/(.*)$':      '<rootDir>/src/store/$1',
    '^@components/(.*)$': '<rootDir>/src/popup/components/$1',
    '\\.css$':            'identity-obj-proxy',
  },
  testMatch: ['**/tests/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
