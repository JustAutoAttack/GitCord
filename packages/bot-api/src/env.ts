import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile =
    nodeEnv === 'production' ? '.env.production' : '.env.development';

dotenv.config({
    path: path.resolve(process.cwd(), envFile)
});

const envSchema = z.object({
    BOT_DOCS_URL: z
        .string()
        .url('SERVER_DOCS_URL must be a valid URL')
        .default('http://localhost:3000/doc')
});

export type EnvDTO = z.infer<typeof envSchema>;

export function getEnv(customEnv = process.env): EnvDTO {
    const _env = envSchema.safeParse(customEnv);

    if (!_env.success) {
        throw new Error(
            `Invalid environment variables:\n${JSON.stringify(_env.error.format(), null, 2)}`
        );
    }

    return _env.data;
}

export const ENV = getEnv();
