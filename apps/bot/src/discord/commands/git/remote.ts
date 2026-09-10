import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandGroupBuilder,
	MessageFlags
} from 'discord.js';

import { ServerAPIRemoteConfigService } from '@server-api';
import { discordLogger } from '@core';
import { COMMAND_DOCS } from '../constants';

export const remoteGroup = new SlashCommandSubcommandGroupBuilder()
	.setName('remote')
	.setDescription(COMMAND_DOCS['remote add'].description)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription(COMMAND_DOCS['remote add'].description)
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription(
						'The GitHub repository URL (e.g., https://github.com/org/repo)'
					)
					.setRequired(true)
			)
			.addChannelOption((option) =>
				option
					.setName('notifications_channel')
					.setDescription(
						'Optional: Route events to a dedicated read-only channel'
					)
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(false)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('list')
			.setDescription(COMMAND_DOCS['remote list'].description)
			.addBooleanOption((option) =>
				option
					.setName('verbose')
					.setDescription('Show detailed channel routing (-v)')
					.setRequired(false)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription(COMMAND_DOCS['remote remove'].description)
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription('The GitHub repository URL to remove')
					.setRequired(true)
			)
	);

export async function executeRemote(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.guildId) {
		discordLogger.warn(
			'Attempted to execute remote command outside of a server context.'
		);
		await interaction.reply({
			content: 'Repository management must be done within a server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	const subcommand = interaction.options.getSubcommand();
	discordLogger.debug(
		`Executing /git remote ${subcommand} in guild ${interaction.guildId} by user ${interaction.user.id}`
	);

	try {
		switch (subcommand) {
			case 'add':
				await handleAdd(interaction);
				break;
			case 'list':
				await handleList(interaction);
				break;
			case 'remove':
				await handleRemove(interaction);
				break;
		}
	} catch (error) {
		discordLogger.error(
			`[Git Remote] Failed to execute ${subcommand}:`,
			error
		);
		await interaction.reply({
			content: 'An error occurred while processing your request.',
			flags: [MessageFlags.Ephemeral]
		});
	}
}

async function handleAdd(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const url = interaction.options.getString('url', true);
	const notifChannel =
		interaction.options.getChannel('notifications_channel') ??
		interaction.channel;

	if (!notifChannel) {
		discordLogger.warn(
			`Invalid channel configuration during /git remote add for repo ${url}`
		);
		await interaction.reply({
			content: 'Invalid channel configuration.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	try {
		const response = await ServerAPIRemoteConfigService.list();
		const allConfigs = Array.isArray(response)
			? response
			: ((response as any)?.data ?? []);

		const existingConfig = allConfigs.find(
			(config: any) =>
				config.repositoryUrl === url &&
				config.guildId === interaction.guildId
		);

		if (existingConfig) {
			discordLogger.warn(
				`Repository ${url} is already linked to server ${interaction.guildId}.`
			);
			await interaction.reply({
				content: `**Repository Already Linked**\nThe repository \`${url}\` is already registered in this server.\n• Commands accepted in: <#${existingConfig.commandChannelId}>\n• Notifications routed to: <#${existingConfig.notificationChannelId}>`,
				flags: [MessageFlags.Ephemeral]
			});
			return;
		}
	} catch (error) {
		discordLogger.debug(
			'Failed to pre-check existing configs during add, proceeding to create:',
			error
		);
	}

	await ServerAPIRemoteConfigService.create({
		guildId: interaction.guildId!,
		repositoryUrl: url,
		commandChannelId: interaction.channelId,
		notificationChannelId: notifChannel.id
	});

	discordLogger.info(
		`Successfully subscribed server ${interaction.guildId} to repository ${url}`
	);
	await interaction.reply({
		content: `**Repository Added**\nSubscribed to \`${url}\`.\n• Commands accepted in: <#${interaction.channelId}>\n• Notifications routed to: <#${notifChannel.id}>`,
		flags: [MessageFlags.Ephemeral]
	});
}

async function handleList(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const isVerbose = interaction.options.getBoolean('verbose') ?? false;

	const response = await ServerAPIRemoteConfigService.list();
	const allConfigs = Array.isArray(response)
		? response
		: ((response as any)?.data ?? []);

	const serverConfigs = allConfigs.filter(
		(config: any) =>
			config.guildId === interaction.guildId ||
			config.commandChannelId === interaction.channelId
	);

	if (serverConfigs.length === 0) {
		discordLogger.debug(
			`No repositories found for server ${interaction.guildId}`
		);
		await interaction.reply({
			content:
				'There are no GitHub repositories configured for this server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	discordLogger.debug(
		`Listing ${serverConfigs.length} configured repositories for server ${interaction.guildId}`
	);
	let message = '**Connected Repositories**\n\n';

	serverConfigs.forEach((config: any) => {
		message += `• **\`${config.repositoryUrl}\`**\n`;
		if (isVerbose) {
			message += `  ↳ **Commands:** <#${config.commandChannelId}>\n`;
			message += `  ↳ **Notifications:** <#${config.notificationChannelId}>\n\n`;
		} else {
			message += `  ↳ Commands: <#${config.commandChannelId}>\n`;
			message += `  ↳ Notifications: <#${config.notificationChannelId}>\n\n`;
		}
	});

	await interaction.reply({
		content: message.trim(),
		flags: [MessageFlags.Ephemeral]
	});
}

async function handleRemove(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const urlToRemove = interaction.options.getString('url', true);

	const response = await ServerAPIRemoteConfigService.list();
	const allConfigs = Array.isArray(response)
		? response
		: ((response as any)?.data ?? []);

	const targetConfig = allConfigs.find(
		(config: any) =>
			config.repositoryUrl === urlToRemove &&
			(config.guildId === interaction.guildId ||
				config.commandChannelId === interaction.channelId)
	);

	if (!targetConfig) {
		discordLogger.warn(
			`Attempted to remove non-existent repository subscription ${urlToRemove} in server ${interaction.guildId}`
		);
		await interaction.reply({
			content: `Could not find a subscription for \`${urlToRemove}\` in this server.`,
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	await ServerAPIRemoteConfigService.delete(targetConfig.id);

	discordLogger.info(
		`Successfully removed repository subscription ${urlToRemove} (ID: ${targetConfig.id}) from server ${interaction.guildId}`
	);
	await interaction.reply({
		content: `**Repository Removed**\nUnsubscribed from \`${urlToRemove}\`.`,
		flags: [MessageFlags.Ephemeral]
	});
}
