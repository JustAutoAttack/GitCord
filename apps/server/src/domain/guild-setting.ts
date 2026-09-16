export namespace GuildSetting {
	export interface Model {
		id: string;
		guildId: string;
		systemChannelId: string;
		notifyOnConnection: boolean;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		guildId: string;
		systemChannelId: string;
		notifyOnConnection?: boolean;
	}

	export interface UpdateInput {
		guildId?: string;
		systemChannelId?: string;
		notifyOnConnection?: boolean;
	}
}
