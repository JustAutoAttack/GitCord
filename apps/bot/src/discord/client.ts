import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';

import { CONFIG, ENV } from '@core';
import { registerClientHandlers, getNotificationChannels } from './handlers';
import { logger } from './logger';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

registerClientHandlers(client);

export async function connectDiscord(): Promise<void> {
	logger.info('Connecting to Discord...');

	await client.login(ENV.DISCORD_BOT_TOKEN);
}

export async function disconnectDiscord(signal: string): Promise<void> {
	logger.info(`Disconnecting from Discord after ${signal}...`);

	try {
		const targetChannels = await getNotificationChannels(client);

		if (targetChannels.length > 0) {
			const embed = new EmbedBuilder()
				.setColor(CONFIG.discord.colors.offline)
				.setTitle('System Update')
				.setDescription(`Shutting down (${signal}).`);

			await Promise.all(
				targetChannels.map(({ channel }) =>
					channel.send({ embeds: [embed] }).catch((error) => {
						logger.error(
							`Failed to send offline notification to channel ${channel.id}:`,
							error
						);
					})
				)
			);
		}
	} catch (error) {
		logger.error('Failed to send Discord offline notifications:', error);
	} finally {
		client.destroy();
	}
}
