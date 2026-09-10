export interface GuildSetting {
	id: string;
	guildId: string;
	systemChannelId: string;
	updatedAt: string;
	createdAt: string;
}

export interface CreateGuildSettingInput {
	guildId: string;
	systemChannelId: string;
}

export interface UpdateGuildSettingInput {
	guildId?: string;
	systemChannelId?: string;
}
