import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

export const ENV = {
	PORT: Number(process.env.PORT) || 3000,
	DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
	DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
	DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || '',
	NGROK_AUTHTOKEN: process.env.NGROK_AUTHTOKEN || ''
};

if (
	!ENV.DISCORD_BOT_TOKEN ||
	!ENV.DISCORD_CHANNEL_ID ||
	!ENV.DISCORD_CLIENT_SECRET ||
	!ENV.DISCORD_CLIENT_ID ||
	!ENV.DISCORD_GUILD_ID ||
	!ENV.NGROK_AUTHTOKEN
) {
	console.error(
		'[Config] Missing required environment variables: DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, or NGROK_AUTHTOKEN'
	);
	process.exit(1);
}
