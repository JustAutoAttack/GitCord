import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'staging', 'production'])
		.default('development'),
	PORT: z.coerce.number().default(4000),
	BASE_URL: z.string().url('BASE_URL must be a valid URL'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	BOT_WEBHOOK_URL: z.string().url('BOT_WEBHOOK_URL must be a valid URL'),
	BOT_WEBHOOK_SECRET: z.string().min(1, 'BOT_WEBHOOK_SECRET is required'),
	GITHUB_APP_ID: z.coerce.number().min(1, 'GITHUB_APP_ID is required'),
	GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
	GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
	GITHUB_PRIVATE_KEY: z.string().min(1, 'GITHUB_PRIVATE_KEY is required'),
	GITHUB_WEBHOOK_SECRET: z
		.string()
		.min(1, 'GITHUB_WEBHOOK_SECRET is required'),
	NGROK_AUTHTOKEN: z.string().optional(),
	NGROK_URL: z.string().url('NGROK_URL must be a valid URL').optional()
});

export type EnvDTO = z.infer<typeof envSchema>;

function loadAndValidateEnv(): EnvDTO {
	const nodeEnv = process.env.NODE_ENV || 'development';
	const envFile = `.env.${nodeEnv}`;

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

	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error('Invalid environment variables:');
		console.error(JSON.stringify(parsed.error.format(), null, 2));
		process.exit(1);
	}

	return parsed.data;
}

export const ENV: EnvDTO = loadAndValidateEnv();
