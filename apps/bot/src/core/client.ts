import {
	Client,
	GatewayIntentBits,
	TextChannel,
	EmbedBuilder
} from 'discord.js';

import { ENV } from '../config';
import { handleInteraction } from '../handlers';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

client.once('clientReady', async (c) => {
	console.log(`[Discord] Bot logged in as ${c.user.tag}`);

	try {
		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);
		if (channel && channel.isTextBased()) {
			const embed = new EmbedBuilder()
				.setColor(0x238636) // GitHub Green
				.setTitle('🟢 Bot Engine Online')
				.setDescription(
					'The system is active, listening for changes, and ready to track events.'
				)
				.setTimestamp();

			await (channel as TextChannel).send({ embeds: [embed] });
		}
	} catch (error) {
		console.error(
			'[Discord] Failed to send online notification message:',
			error
		);
	}
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isChatInputCommand()) {
		await handleInteraction(interaction);
	}
});

export async function loginBot() {
	await client.login(ENV.DISCORD_BOT_TOKEN);
}

async function gracefulShutdown(signal: string) {
	console.log(`[Lifecycle] Received ${signal}. Shutting down gracefully...`);
	try {
		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);
		if (channel && channel.isTextBased()) {
			const embed = new EmbedBuilder()
				.setColor(0xda3633) // GitHub Red
				.setTitle('🔴 Bot Engine Offline')
				.setDescription(
					`Received system signal \`${signal}\`. Shutting down engine...`
				)
				.setTimestamp();

			await (channel as TextChannel).send({ embeds: [embed] });
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
