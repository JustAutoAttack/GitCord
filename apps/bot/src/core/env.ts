import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Define the runtime environment schema with type constraints and defaults
const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'staging', 'production'])
		.default('development'),
	PORT: z.coerce.number().default(3001),
	BASE_URL: z.string().url('BASE_URL must be a valid URL'),
	DISCORD_BOT_TOKEN: z.string().min(1, 'DISCORD_BOT_TOKEN is required'),
	DISCORD_CLIENT_SECRET: z
		.string()
		.min(1, 'DISCORD_CLIENT_SECRET is required'),
	DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
	DISCORD_DEPLOY_GUILD_ID: z.string().optional(),
	NGROK_AUTHTOKEN: z.string().optional(),
	SERVER_API_URL: z.string().url('SERVER_API_URL must be a valid URL'),
	SERVER_WEBHOOK_SECRET: z
		.string()
		.min(1, 'SERVER_WEBHOOK_SECRET is required')
});

export type EnvDTO = z.infer<typeof envSchema>;

/**
 * Loads the appropriate environment file based on NODE_ENV and validates it against the schema.
 */
function loadAndValidateEnv(): EnvDTO {
	const nodeEnv = process.env.NODE_ENV || 'development';
	const envFile = `.env.${nodeEnv}`;

	// Read the targeted environment file
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

	// Parse and validate process.env data
	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error('Invalid environment variables:');
		console.error(JSON.stringify(parsed.error.format(), null, 2));
		process.exit(1);
	}

	return parsed.data;
}

// Export the validated configuration object for global use
export const ENV: EnvDTO = loadAndValidateEnv();
