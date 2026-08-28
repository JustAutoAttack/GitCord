import { ChatInputCommandInteraction } from 'discord.js';
import { commands } from '../commands';

export async function handleInteraction(
	interaction: ChatInputCommandInteraction
) {
	if (!interaction.isChatInputCommand()) return;

	const matchedCommand = commands.find(
		(cmd) => cmd.data.name === interaction.commandName
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
