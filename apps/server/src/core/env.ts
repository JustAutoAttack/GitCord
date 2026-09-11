import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile =
	nodeEnv === 'production' ? '.env.production' : '.env.development';

const result = dotenv.config({
	path: path.resolve(process.cwd(), envFile),
	override: true
});

if (result.error) {
	console.error(
		`Failed to load environment file from ${envFile}: ${result.error.message}`
	);
	process.exit(1);
}

const envSchema = z.object({
	BASE_URL: z.string().url('BASE_URL must be a valid URL'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	BOT_WEBHOOK_URL: z.string().url('BOT_WEBHOOK_URL must be a valid URL'),
	BOT_WEBHOOK_SECRET: z.string().min(1, 'BOT_WEBHOOK_SECRET is required')
});

export type EnvDTO = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error(
		`Invalid environment variables:\n${JSON.stringify(_env.error.format(), null, 2)}`
	);
	process.exit(1);
}

export const ENV = _env.data;
