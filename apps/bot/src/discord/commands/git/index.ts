import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { remoteGroup, executeRemote } from './remote';
import { configGroup, executeConfig } from './config';
import { helpSubcommand, executeHelp } from './help';

export const gitCommand = {
	data: new SlashCommandBuilder()
		.setName('git')
		.setDescription('GitCord GitHub commands')
		.addSubcommandGroup(remoteGroup)
		.addSubcommandGroup(configGroup)
		.addSubcommand(helpSubcommand),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const group = interaction.options.getSubcommandGroup(false);
		const subcommand = interaction.options.getSubcommand(false);

		if (subcommand === 'help') {
			await executeHelp(interaction);
			return;
		}

		switch (group) {
			case 'remote':
				await executeRemote(interaction);
				break;
			case 'config':
				await executeConfig(interaction);
				break;
			default:
				await interaction.reply({
					content: 'Unknown command or subcommand group.',
					ephemeral: true
				});
				break;
		}
	}
};
