import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { initSubcommand, executeInit } from './init';
import { configSubcommand, executeConfig } from './config';

export const gitCommand = {
	data: new SlashCommandBuilder()
		.setName('git')
		.setDescription('GitCord GitHub commands')
		.addSubcommand(initSubcommand)
		.addSubcommand(configSubcommand),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommand()) {
			case 'init':
				await executeInit(interaction);
				break;
			case 'config':
				await executeConfig(interaction);
				break;
		}
	}
};

export const commands = [gitCommand];
