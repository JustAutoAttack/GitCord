import { EnvDTO, envSchema } from './schema';

function loadAndValidateEnv(): EnvDTO {
	const rawEnv = {
		MODE: import.meta.env.MODE,
		VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
		VITE_BASE_URL: import.meta.env.VITE_BASE_URL
	};

	const parsed = envSchema.safeParse(rawEnv);

	if (!parsed.success) {
		console.error('Invalid frontend environment variables:');
		console.error(JSON.stringify(parsed.error.format(), null, 2));
		throw new Error('Invalid frontend environment configuration.');
	}

	return parsed.data;
}

export const ENV: EnvDTO = loadAndValidateEnv();
