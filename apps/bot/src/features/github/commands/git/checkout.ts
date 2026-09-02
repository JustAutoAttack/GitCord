import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder
} from 'discord.js';

import { rest_api } from '../../services';

export const checkoutSubcommand = new SlashCommandSubcommandBuilder()
	.setName('checkout')
	.setDescription('List repository branches');

export async function executeCheckout(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	await interaction.deferReply();

	try {
		const branches = await rest_api.getBranches();

		if (branches.length === 0) {
			await interaction.editReply('No branches were found.');

			return;
		}

		const branchList = branches
			.map((branch) => `\`${branch.name}\``)
			.join('\n');

		await interaction.editReply(`### Branches\n${branchList}`);
	} catch (error) {
		console.error('Failed to fetch GitHub branches:', error);

		await interaction.editReply('Failed to fetch GitHub branches.');
	}
}
