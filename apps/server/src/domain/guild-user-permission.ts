export namespace GuildUserPermission {
	export interface Model {
		id: string;
		guildId: string;
		discordUserId: string;
		commandId: string;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		guildId: string;
		discordUserId: string;
		commandId: string;
	}

	export interface UpdateInput {
		guildId?: string;
		discordUserId?: string;
		commandId?: string;
	}
}
