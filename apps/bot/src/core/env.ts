import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { AppError } from './errors';

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
	DISCORD_BOT_TOKEN: z.string().min(1, 'DISCORD_BOT_TOKEN is required'),
	DISCORD_CHANNEL_ID: z.string().min(1, 'DISCORD_CHANNEL_ID is required'),
	DISCORD_CLIENT_SECRET: z
		.string()
		.min(1, 'DISCORD_CLIENT_SECRET is required'),
	DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
	DISCORD_GUILD_ID: z.string().min(1, 'DISCORD_GUILD_ID is required'),
	NGROK_AUTHTOKEN: z.string().min(1, 'NGROK_AUTHTOKEN is required'),
	SERVER_API_URL: z.string().url('SERVER_API_URL must be a valid URL')
});

export type EnvDTO = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error('Invalid environment variables:');
	console.error(JSON.stringify(_env.error.format(), null, 2));
	process.exit(1);
}

export const ENV: EnvDTO = _env.data;
