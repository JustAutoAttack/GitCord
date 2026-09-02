import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder
} from 'discord.js';

import { rest_api } from '../../services';

export const statusSubcommand = new SlashCommandSubcommandBuilder()
	.setName('status')
	.setDescription('Show repository status');

export async function executeStatus(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	await interaction.deferReply();

	try {
		const repository = await rest_api.getRepository();

		await interaction.editReply(
			[
				'### Repository Status',
				`**Repository:** \`${repository.full_name}\``,
				`**Default branch:** \`${repository.default_branch}\``,
				`**Size:** \`${repository.size ?? 0} KB\``,
				`**Created:** <t:${Math.floor(
					new Date(repository.created_at).getTime() / 1000
				)}:f>`
			].join('\n')
		);
	} catch (error) {
		console.error('Failed to fetch GitHub repository status:', error);

		await interaction.editReply(
			'Failed to fetch GitHub repository status.'
		);
	}
}
