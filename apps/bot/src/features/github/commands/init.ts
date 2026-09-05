import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandBuilder,
	MessageFlags
} from 'discord.js';

export const initSubcommand = new SlashCommandSubcommandBuilder()
	.setName('init')
	.setDescription('Initialize a repository and bind it to a commands channel')
	.addStringOption((option) =>
		option
			.setName('link')
			.setDescription('Repository URL')
			.setRequired(true)
	)
	.addChannelOption((option) =>
		option
			.setName('commands_channel')
			.setDescription(
				'Channel dedicated to sending commands for this repository'
			)
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true)
	)
	.addChannelOption((option) =>
		option
			.setName('notifications_channel')
			.setDescription(
				'Channel for event notifications (defaults to commands channel)'
			)
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false)
	);

export async function executeInit(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const repoLink = interaction.options.getString('link', true);
	const commandsChannel = interaction.options.getChannel(
		'commands_channel',
		true,
		[ChannelType.GuildText]
	);
	const notificationsChannel =
		interaction.options.getChannel('notifications_channel', false, [
			ChannelType.GuildText
		]) || commandsChannel;

	// TODO: Replace with API call to store stateless configuration
	await interaction.reply({
		content: `Initialized repo \`${repoLink}\`.\n• Commands: <#${commandsChannel.id}>\n• Notifications: <#${notificationsChannel.id}>`,
		flags: [MessageFlags.Ephemeral]
	});
}
