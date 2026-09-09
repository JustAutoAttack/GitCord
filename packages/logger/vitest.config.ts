import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],

	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		globals: true,
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: [
				'src/types.ts',
				'src/config/index.ts',
				'src/utils/index.ts'
			],
			reporter: ['text', 'html']
		}
	}
});
