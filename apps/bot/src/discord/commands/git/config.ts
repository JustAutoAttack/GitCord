import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandGroupBuilder,
	MessageFlags,
	PermissionFlagsBits,
	ContainerBuilder,
	TextDisplayBuilder
} from 'discord.js';

import { ServerAPIGuildSettingService } from '@features/server';
import { logger } from '../../logger';
import { COMMAND_DOCS } from '../constants';

export const configGroup = new SlashCommandSubcommandGroupBuilder()
	.setName('config')
	.setDescription('Configure server, bot preferences, and event routing')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('server')
			.setDescription(COMMAND_DOCS['config server'].description)
			.addChannelOption((option) =>
				option
					.setName('system_channel')
					.setDescription(
						'Default channel for server-wide GitCord notifications and alerts'
					)
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName('notify_on_connection')
					.setDescription(
						'Enable or disable connection/status notifications'
					)
					.addChoices(
						{ name: 'Yes', value: 'true' },
						{ name: 'No', value: 'false' }
					)
					.setRequired(false)
			)
	);

export async function executeConfig(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.guildId || !interaction.inGuild() || !interaction.guild) {
		logger.warn(
			'Attempted to execute config command outside of a server context.'
		);
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'Server configuration must be done within a server.'
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	if (
		interaction.guild.ownerId !== interaction.user.id &&
		!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
	) {
		logger.warn(
			`User ${interaction.user.id} attempted to configure server ${interaction.guildId} without permissions.`
		);
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'You must be the server owner or an administrator to configure server settings.'
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	const subcommand = interaction.options.getSubcommand();
	logger.debug(
		`Executing /git config ${subcommand} in guild ${interaction.guildId} by user ${interaction.user.id}`
	);

	try {
		switch (subcommand) {
			case 'server':
				await handleServerConfig(interaction);
				break;
			default: {
				const container =
					new ContainerBuilder().addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							'Unknown configuration subcommand.'
						)
					);
				await interaction.reply({
					components: [container],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
				});
			}
		}
	} catch (error) {
		logger.error(`[Git Config] Failed to execute ${subcommand}:`, error);

		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'An error occurred while processing your server configuration request.'
			)
		);

		if (interaction.deferred || interaction.replied) {
			await interaction.editReply({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		} else {
			await interaction.reply({
				components: [container],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
			});
		}
	}
}

async function handleServerConfig(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	await interaction.deferReply({
		flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
	});

	const guildId = interaction.guildId!;
	const selectedSystemChannel =
		interaction.options.getChannel('system_channel');
	const notifyVal = interaction.options.getString('notify_on_connection');

	const notifyOnConnection =
		notifyVal !== null ? notifyVal === 'true' : undefined;

	let setting;

	try {
		setting = await ServerAPIGuildSettingService.getByGuildId(guildId);
	} catch {
		// Setting does not exist or could not be fetched.
	}

	const systemChannelId =
		selectedSystemChannel?.id ??
		setting?.systemChannelId ??
		interaction.channelId;

	const container = new ContainerBuilder();

	if (setting) {
		await ServerAPIGuildSettingService.update(setting.id, {
			systemChannelId,
			...(notifyOnConnection !== undefined ? { notifyOnConnection } : {})
		});

		logger.info(
			`Successfully updated server configuration for guild ${guildId}. System channel set to ${systemChannelId}`
		);

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`### Server Configuration Updated\nSystem notification channel set to <#${systemChannelId}>${
					notifyOnConnection !== undefined
						? `\nNotify on connection: **${
								notifyOnConnection ? 'Yes' : 'No'
							}**`
						: ''
				}.`
			)
		);
	} else {
		await ServerAPIGuildSettingService.create({
			guildId,
			systemChannelId,
			...(notifyOnConnection !== undefined ? { notifyOnConnection } : {})
		});

		logger.info(
			`Successfully completed initial server setup for guild ${guildId}. System channel set to ${systemChannelId}`
		);

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`### Initial Server Setup Complete\nSystem notification channel set to <#${systemChannelId}>${
					notifyOnConnection !== undefined
						? `\nNotify on connection: **${
								notifyOnConnection ? 'Yes' : 'No'
							}**`
						: ''
				}.`
			)
		);
	}

	await interaction.editReply({
		components: [container],
		flags: MessageFlags.IsComponentsV2
	});
}