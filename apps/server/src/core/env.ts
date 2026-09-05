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
		`Failed to load environment file from ${envFile}:`,
		result.error
	);
	process.exit(1);
}

const envSchema = z.object({
	PORT: z
		.string()
		.default('3000')
		.transform((val) => parseInt(val, 10))
		.pipe(z.number().positive('PORT must be a positive number')),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required')
});

export type EnvDTO = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error('Invalid environment variables:');
	console.error(JSON.stringify(_env.error.format(), null, 2));
	process.exit(1);
}

export const ENV: EnvDTO = _env.data;
