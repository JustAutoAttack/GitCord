import path from 'node:path';
import dotenv from 'dotenv';

import { EnvDTO, envSchema } from './schema';

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
