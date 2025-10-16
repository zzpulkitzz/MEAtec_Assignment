/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        tsconfig: {
          esModuleInterop: true,
        }
      }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts',
    ],
    coverageDirectory: 'coverage',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testTimeout: 30000,
    verbose: true,
  };
  