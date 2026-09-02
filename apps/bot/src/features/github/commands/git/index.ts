import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { checkoutSubcommand, executeCheckout } from './checkout';

export const gitCommand = {
	data: new SlashCommandBuilder()
		.setName('git')
		.setDescription('GitHub commands')
		.addSubcommand(checkoutSubcommand),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommand()) {
			case 'checkout':
				await executeCheckout(interaction);
				break;
		}
	}
};

export const commands = [gitCommand];
