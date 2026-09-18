import { z } from 'zod';

export const envSchema = z.object({
	MODE: z
		.enum(['development', 'staging', 'production'])
		.default('development'),
	VITE_SERVER_URL: z.string().url('VITE_SERVER_URL must be a valid URL'),
	VITE_BASE_URL: z
		.string()
		.url('VITE_BASE_URL must be a valid URL')
		.optional()
});

export type EnvDTO = z.infer<typeof envSchema>;
