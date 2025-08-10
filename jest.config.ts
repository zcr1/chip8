import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*.test.(ts|tsx|js|jsx)'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
};

export default config;
