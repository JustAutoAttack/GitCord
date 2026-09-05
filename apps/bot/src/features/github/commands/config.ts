import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandBuilder
} from 'discord.js';

export const configSubcommand = new SlashCommandSubcommandBuilder()
	.setName('config')
	.setDescription('Update current repository configuration')
	.addStringOption((option) =>
		option
			.setName('link')
			.setDescription('New repository URL')
			.setRequired(false)
	)
	.addChannelOption((option) =>
		option
			.setName('commands_channel')
			.setDescription('New commands channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false)
	)
	.addChannelOption((option) =>
		option
			.setName('notifications_channel')
			.setDescription('New notifications channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false)
	);

export async function executeConfig(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const repoLink = interaction.options.getString('link');
	const commandsChannel = interaction.options.getChannel(
		'commands_channel',
		false,
		[ChannelType.GuildText]
	);
	const notificationsChannel = interaction.options.getChannel(
		'notifications_channel',
		false,
		[ChannelType.GuildText]
	);

	// TODO: Replace with API call to update stateless configuration
	await interaction.reply({
		content: `Configuration updated successfully for context channel <#${interaction.channelId}>.`,
		ephemeral: true
	});
}
