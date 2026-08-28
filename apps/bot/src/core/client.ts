import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

import { ENV } from '../config';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

client.once('clientReady', async (c) => {
	console.log(`[Discord] Bot logged in as ${c.user.tag}`);

	try {
		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);
		if (channel && channel.isTextBased()) {
			await (channel as TextChannel).send(
				'**Bot Engine is online and listening for changes!**'
			);
		}
	} catch (error) {
		console.error(
			'[Discord] Failed to send online notification message:',
			error
		);
	}
});

export async function loginBot() {
	await client.login(ENV.DISCORD_BOT_TOKEN);
}

// Graceful shutdown handler for terminal interruption (Ctrl+C, kill signals)
async function gracefulShutdown(signal: string) {
	console.log(`[Lifecycle] Received ${signal}. Shutting down gracefully...`);
	try {
		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);
		if (channel && channel.isTextBased()) {
			await (channel as TextChannel).send(
				'**Bot Engine is going offline.**'
			);
		}
	} catch (error) {
		console.error(
			'[Discord] Failed to send offline notification message:',
			error
		);
	} finally {
		client.destroy();
		process.exit(0);
	}
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
