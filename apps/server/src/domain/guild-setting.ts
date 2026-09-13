export namespace GuildSetting {
	export interface Model {
		id: string;
		guildId: string;
		systemChannelId: string;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		guildId: string;
		systemChannelId: string;
	}

	export interface UpdateInput {
		guildId?: string;
		systemChannelId?: string;
	}
}
