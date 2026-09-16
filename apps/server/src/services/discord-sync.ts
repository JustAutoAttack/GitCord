import { REST, Routes } from 'discord.js';

import { appLogger, ENV } from '@core';
import { guildSettingsService } from './guild-settings';

export class DiscordSyncService {
	private async resolveSystemChannelId(
		rest: REST,
		guildId: string
	): Promise<string | undefined> {
		try {
			const fullGuild = (await rest.get(Routes.guild(guildId))) as {
				system_channel_id?: string | null;
			};
			if (fullGuild.system_channel_id) {
				return fullGuild.system_channel_id;
			}
		} catch (detailErr) {
			appLogger.warn(
				`[Discord Sync] Could not fetch details for guild ID: ${guildId}`,
				detailErr
			);
		}

		try {
			const channels = (await rest.get(
				Routes.guildChannels(guildId)
			)) as Array<{
				id: string;
				type: number;
			}>;
			// Discord channel type 0 is GuildText
			const textChannel = channels.find((c) => c.type === 0);
			return textChannel?.id;
		} catch (channelErr) {
			appLogger.warn(
				`[Discord Sync] Could not fetch channels for guild ID: ${guildId}`,
				channelErr
			);
		}

		return undefined;
	}

	private async processMissingGuilds(
		rest: REST,
		guilds: Array<{ id: string; name: string }>
	) {
		const localGuildSettings = await guildSettingsService.list();
		const localGuildIds = new Set(localGuildSettings.map((g) => g.guildId));

		for (const botGuild of guilds) {
			if (!localGuildIds.has(botGuild.id)) {
				const systemChannelId = await this.resolveSystemChannelId(
					rest,
					botGuild.id
				);

				if (!systemChannelId) {
					appLogger.warn(
						`[Discord Sync] Skipping guild settings creation for server ID: ${botGuild.id} (${botGuild.name}) because no valid text-based system channel could be found.`
					);
					continue;
				}

				await guildSettingsService.create({
					guildId: botGuild.id,
					systemChannelId,
					notifyOnConnection: true
				});
				appLogger.info(
					`[Discord Sync] Created missing guild settings record for server ID: ${botGuild.id} (${botGuild.name}) with system channel ID: ${systemChannelId}`
				);
			}
		}

		return localGuildSettings;
	}

	private checkStaleGuilds(
		guilds: Array<{ id: string }>,
		localGuildSettings: Array<{ guildId: string }>
	) {
		const remoteGuildIds = new Set(guilds.map((g) => g.id));
		for (const localSetting of localGuildSettings) {
			if (!remoteGuildIds.has(localSetting.guildId)) {
				appLogger.info(
					`[Discord Sync] Found stale local guild setting for server ID ${localSetting.guildId} (Bot is no longer in this guild).`
				);
			}
		}
	}

	async sync(): Promise<void> {
		if (!ENV.DISCORD_BOT_TOKEN) {
			appLogger.warn(
				'[Discord Sync] Skipping sync: Missing DISCORD_BOT_TOKEN.'
			);
			return;
		}

		const rest = new REST({ version: '10' }).setToken(
			ENV.DISCORD_BOT_TOKEN
		);

		try {
			appLogger.info(
				'[Discord Sync] Fetching guilds from Discord REST API...'
			);

			const guilds = (await rest.get(Routes.userGuilds())) as Array<{
				id: string;
				name: string;
			}>;

			const localGuildSettings = await this.processMissingGuilds(
				rest,
				guilds
			);
			this.checkStaleGuilds(guilds, localGuildSettings);

			appLogger.info(
				'[Discord Sync] Discord guild synchronization completed successfully.'
			);
		} catch (err) {
			appLogger.error(
				'[Discord Sync] Failed to synchronize Discord guild settings:',
				err
			);
		}
	}
}

export const discordSyncService = new DiscordSyncService();
