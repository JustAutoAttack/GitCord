import { z } from 'zod';

const envSchema = z.object({
	SERVER_DOCS_URL: z
		.string()
		.url('SERVER_DOCS_URL must be a valid URL')
		.default('http://localhost:3000/doc')
});

export type EnvDTO = z.infer<typeof envSchema>;

export function getEnv(customEnv: Record<string, unknown> = {}): EnvDTO {
	// If we are in the browser, fall back gracefully to defaults or window config
	if (typeof window !== 'undefined') {
		return envSchema.parse({});
	}

	// Only load dotenv and resolve paths if running in a Node.js environment
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const path = require('node:path');
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const dotenv = require('dotenv');

		const nodeEnv = process.env.NODE_ENV || 'development';
		const envFile =
			nodeEnv === 'production' ? '.env.production' : '.env.development';

		dotenv.config({
			path: path.resolve(process.cwd(), envFile)
		});
	} catch {
		// Fallback if require is unavailable
	}

	const targetEnv =
		Object.keys(customEnv).length > 0 ? customEnv : process.env;
	const _env = envSchema.safeParse(targetEnv);

	if (!_env.success) {
		throw new Error(
			`Invalid environment variables:\n${JSON.stringify(_env.error.format(), null, 2)}`
		);
	}

	return _env.data;
}

// Lazy-evaluated or guarded export to prevent top-level browser crashes
export const ENV =
	typeof window !== 'undefined' ? envSchema.parse({}) : getEnv();
