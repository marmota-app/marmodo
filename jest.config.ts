import type {Config} from '@jest/types'
import fs from 'fs'

// Sync object
const config: Config.InitialOptions = {
	testEnvironment: "node",
	setupFilesAfterEnv: [ "<rootDir>/test/setup.ts",  ],
	preset: 'ts-jest',
};
export default config
