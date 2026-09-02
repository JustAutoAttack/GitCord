import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { checkoutSubcommand, executeCheckout } from './checkout';
import { statusSubcommand, executeStatus } from './status';

export const gitCommand = {
	data: new SlashCommandBuilder()
		.setName('git')
		.setDescription('GitHub commands')
		.addSubcommand(checkoutSubcommand)
		.addSubcommand(statusSubcommand),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommand()) {
			case 'checkout':
				await executeCheckout(interaction);
				break;

			case 'status':
				await executeStatus(interaction);
				break;
		}
	}
};

export const commands = [gitCommand];
