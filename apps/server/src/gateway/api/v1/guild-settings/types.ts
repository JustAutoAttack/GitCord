export interface GuildSettingResponse {
	id: string;
	guildId: string;
	systemChannelId: string;
	updatedAt: string;
	createdAt: string;
}

export interface CreateGuildSettingRequest {
	guildId: string;
	systemChannelId: string;
}

export interface UpdateGuildSettingRequest {
	guildId?: string;
	systemChannelId?: string;
}

export interface GuildSettingParam {
	id: string;
}

export interface GuildIdParam {
	guildId: string;
}

export interface SystemChannelParam {
	systemChannelId: string;
}

export interface GuildSettingActionResponse {
	success: boolean;
	message: string;
}
