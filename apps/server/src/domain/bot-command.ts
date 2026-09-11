export namespace BotCommand {
	export interface Model {
		id: string;
		commandName: string;
		description: string;
		createdAt: string;
		updatedAt: string;
	}

	export interface CreateInput {
		commandName: string;
		description: string;
	}

	export interface UpdateInput {
		commandName?: string;
		description?: string;
	}
}
