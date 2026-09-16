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
				// OpenAPI base definition
				'src/app/openapi.ts',

				// Barrel files and types (no runtime logic to cover)
				'src/**/index.ts',
				'src/core/types/**/*.ts',

				// Generated or external layers
				'src/database/generated/**',

				// Pure domain layer definitions (unimplemented/interfaces)
				'src/domain/**/*',

				// Logger files
				'src/**/logger.ts',
				'src/**/loggers.ts'
			],
			reporter: ['text', 'html']
		}
	}
});
