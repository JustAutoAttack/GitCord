import { z } from 'zod';

export const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'staging', 'production'])
		.default('development'),
	PORT: z.coerce.number().default(4000),
	BASE_URL: z.string().url('BASE_URL must be a valid URL'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
	DISCORD_BOT_TOKEN: z.string().optional(),
	DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
	DISCORD_CLIENT_SECRET: z
		.string()
		.min(1, 'DISCORD_CLIENT_SECRET is required'),
	DISCORD_REDIRECT_URI: z
		.string()
		.url('DISCORD_REDIRECT_URI must be a valid URL'),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	BOT_WEBHOOK_URL: z.string().url('BOT_WEBHOOK_URL must be a valid URL'),
	BOT_WEBHOOK_SECRET: z.string().min(1, 'BOT_WEBHOOK_SECRET is required'),
	DASHBOARD_URL: z.string().min(1, 'DASHBOARD_URL is required'),
	GITHUB_APP_ID: z.coerce.number().min(1, 'GITHUB_APP_ID is required'),
	GITHUB_APP_SLUG: z.string().min(1, 'GITHUB_APP_SLUG is required'),
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
