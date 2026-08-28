import dotenv from 'dotenv';
import path from 'path';

// __dirname points to apps/bot/src/config during tsx execution
// So we go up two levels to reach apps/bot/.env
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

export const ENV = {
	PORT: Number(process.env.PORT) || 3000,
	DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
	DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
	NGROK_AUTHTOKEN: process.env.NGROK_AUTHTOKEN || ''
};

if (
	!ENV.DISCORD_BOT_TOKEN ||
	!ENV.DISCORD_CHANNEL_ID ||
	!ENV.DISCORD_CLIENT_SECRET ||
	!ENV.NGROK_AUTHTOKEN
) {
	console.error(
		'[Config] Missing required environment variables: DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, DISCORD_CLIENT_SECRET, or NGROK_AUTHTOKEN'
	);
	process.exit(1);
}
