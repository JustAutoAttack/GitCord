import dotenv from 'dotenv';

import { resolveRootPath } from '@shared';

dotenv.config({
	path: resolveRootPath('.env')
});

export interface Environment {
	PORT: number;
	DISCORD_BOT_TOKEN: string;
	DISCORD_CHANNEL_ID: string;
	DISCORD_CLIENT_SECRET: string;
	DISCORD_CLIENT_ID: string;
	DISCORD_GUILD_ID: string;
	NGROK_AUTHTOKEN: string;
}

export const ENV: Environment = {
	PORT: Number(process.env.PORT) || 3000,
	DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ?? '',
	DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID ?? '',
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ?? '',
	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? '',
	DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID ?? '',
	NGROK_AUTHTOKEN: process.env.NGROK_AUTHTOKEN ?? ''
};

export function validateEnvironment(): void {
	const requiredVariables: Array<keyof Environment> = [
		'DISCORD_BOT_TOKEN',
		'DISCORD_CHANNEL_ID',
		'DISCORD_CLIENT_SECRET',
		'DISCORD_CLIENT_ID',
		'DISCORD_GUILD_ID',
		'NGROK_AUTHTOKEN'
	];

	const missingVariables = requiredVariables.filter((name) => !ENV[name]);

	if (missingVariables.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missingVariables.join(', ')}`
		);
	}
}
