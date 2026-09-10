export interface ListRemoteConfigsQuery {
	guildId?: string;
}

export interface GetByGuildAndRemoteQuery {
	guildId: string;
	repositoryUrl: string;
}

export interface RemoteConfigResponse {
	id: string;
	guildId: string;
	repositoryUrl: string;
	commandChannelId: string;
	notificationChannelId: string;
	updatedAt: string;
	createdAt: string;
}

export interface CreateRemoteConfigRequest {
	guildId: string;
	repositoryUrl: string;
	commandChannelId: string;
	notificationChannelId: string;
}

export interface UpdateRemoteConfigRequest {
	guildId?: string;
	repositoryUrl?: string;
	commandChannelId?: string;
	notificationChannelId?: string;
}

export interface RemoteConfigParam {
	id: string;
}

export interface CommandChannelParam {
	commandChannelId: string;
}

export interface RemoteConfigActionResponse {
	success: boolean;
	message: string;
}
