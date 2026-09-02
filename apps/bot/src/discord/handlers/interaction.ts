import { ChatInputCommandInteraction } from 'discord.js';

import { commands as github_commands } from '@features/github';

export async function handleInteraction(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const matchedCommand = github_commands.find(
		(command) => command.data.name === interaction.commandName
	);

	if (!matchedCommand) {
		console.error(
			`No command matching ${interaction.commandName} was found.`
		);

		return;
	}

	try {
		await matchedCommand.execute(interaction);
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}:`, error);

		const errorMessage = {
			content: 'There was an error while executing this command!',
			ephemeral: true
		};

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(errorMessage);
		} else {
			await interaction.reply(errorMessage);
		}
	}
}
