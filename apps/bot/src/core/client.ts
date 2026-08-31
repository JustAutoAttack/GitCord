import {
	Client,
	GatewayIntentBits,
	TextChannel,
	ContainerBuilder,
	TextDisplayBuilder,
	MessageFlags
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
			const container = new ContainerBuilder()
				.setAccentColor(0x238636) // GitHub Green
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						'**Bot Engine Online**\nSystem is active, listening for changes, and tracking repository events.'
					)
				);

			await (channel as TextChannel).send({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
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
			const container = new ContainerBuilder()
				.setAccentColor(0xda3633) // GitHub Red
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**Bot Engine Offline**\nReceived system signal \`${signal}\`. Shutting down engine...`
					)
				);

			await (channel as TextChannel).send({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
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
