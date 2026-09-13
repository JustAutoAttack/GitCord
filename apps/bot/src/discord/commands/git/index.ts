import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { remoteGroup, executeRemote } from './remote';
import { configGroup, executeConfig } from './config';
import { helpSubcommand, executeHelp } from './help';
import { statusSubcommand, executeStatus } from './status';
import { logSubcommand, executeLog } from './log';

export const gitCommand = {
	data: new SlashCommandBuilder()
		.setName('git')
		.setDescription('GitCord GitHub commands')
		.addSubcommandGroup(remoteGroup)
		.addSubcommandGroup(configGroup)
		.addSubcommand(helpSubcommand)
		.addSubcommand(statusSubcommand)
		.addSubcommand(logSubcommand),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const group = interaction.options.getSubcommandGroup(false);
		const subcommand = interaction.options.getSubcommand(false);

		// Handle standalone subcommands first
		if (!group) {
			switch (subcommand) {
				case 'help':
					await executeHelp(interaction);
					return;
				case 'status':
					await executeStatus(interaction);
					return;
				case 'log':
					await executeLog(interaction);
					return;
				default:
					await interaction.reply({
						content: 'Unknown command.',
						ephemeral: true
					});
					return;
			}
		}

		// Handle subcommand groups
		switch (group) {
			case 'remote':
				await executeRemote(interaction);
				break;
			case 'config':
				await executeConfig(interaction);
				break;
			default:
				await interaction.reply({
					content: 'Unknown subcommand group.',
					ephemeral: true
				});
				break;
		}
	}
};
