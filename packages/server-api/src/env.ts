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
	SERVER_DOCS_URL: z
		.string()
		.url('SERVER_DOCS_URL must be a valid URL')
		.default('http://localhost:3000/doc')
});

export type EnvDTO = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error('Invalid environment variables:');
	console.error(JSON.stringify(_env.error.format(), null, 2));
	process.exit(1);
}

export const ENV: EnvDTO = _env.data;
