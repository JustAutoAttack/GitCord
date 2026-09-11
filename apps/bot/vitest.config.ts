import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],

	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],

		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: [
				// Core
				'src/core/index.ts',
				'src/core/utils/index.ts',

				// Discord
				'src/discord/index.ts',
				'src/discord/handlers/index.ts',
				'src/discord/commands/index.ts',

				// GitHub
				'src/features/github/index.ts',
				'src/features/github/services/index.ts',
				'src/features/github/types/**/*.ts',

				// Server API
				'src/server-api/index.ts',
				'src/server-api/services/index.ts'
			],
			reporter: ['text', 'html']
		}
	}
});
