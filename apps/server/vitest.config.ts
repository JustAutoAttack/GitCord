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
				'src/core/types.ts',
				'src/core/errors/index.ts',
				'src/core/middleware/index.ts',
				'src/core/services/index.ts',

				// Database
				'src/database/generated/**',
				'src/database/index.ts',
				'src/database/repos/index.ts',

				// Domain
				'src/domain/**/*',

				// Services
				'src/services/index.ts',

				// Gateway
				'src/gateway/index.ts',
				'src/gateway/health/index.ts',
				'src/gateway/utils/index.ts',
				'src/gateway/api/v1/auth/index.ts',
				'src/gateway/api/v1/users/index.ts',
				'src/gateway/api/v1/user-sessions/index.ts',
				'src/gateway/api/v1/bot-commands/index.ts',
				'src/gateway/api/v1/guild-settings/index.ts',
				'src/gateway/api/v1/guild-user-permissions/index.ts',
				'src/gateway/api/v1/remote-configs/index.ts'
			],
			reporter: ['text', 'html']
		}
	}
});
