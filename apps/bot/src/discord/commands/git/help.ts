import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	MessageFlags
} from 'discord.js';

import { discordLogger } from '@core';
import { COMMAND_DOCS } from '../constants';

export const helpSubcommand = new SlashCommandSubcommandBuilder()
	.setName('help')
	.setDescription(
		'Display documentation and usage guide for GitCord commands'
	)
	.addStringOption((option) =>
		option
			.setName('command')
			.setDescription(
				'Specific command or subcommand to inspect (e.g., remote add, config server)'
			)
			.setRequired(false)
	);

export async function executeHelp(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const query = interaction.options
		.getString('command')
		?.toLowerCase()
		.trim();
	discordLogger.debug(`Executing /git help with query: "${query || 'all'}"`);

	if (query) {
		const match = (COMMAND_DOCS as Record<string, any>)[query];
		if (!match) {
			await interaction.reply({
				content: `Could not find documentation for \`/git ${query}\`. Use \`/git help\` to view all commands.`,
				flags: [MessageFlags.Ephemeral]
			});
			return;
		}

		await interaction.reply({
			content: `**${match.title}**\n\n• **Description:** ${match.description}\n• **Syntax:** \`${match.syntax}\`\n• **Details:** ${match.details}`,
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	let summary = '**GitCord Command Reference**\n\n';
	for (const [key, doc] of Object.entries(COMMAND_DOCS)) {
		summary += `• **\`/git ${key}\`** — ${doc.description}\n`;
	}
	summary +=
		'\n*Use `/git help <command>` (e.g., `/git help remote add`) for detailed syntax and usage.*';

	await interaction.reply({
		content: summary,
		flags: [MessageFlags.Ephemeral]
	});
}
