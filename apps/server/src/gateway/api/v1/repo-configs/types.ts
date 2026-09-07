export interface RepoConfigResponse {
	id: string;
	guildId: string;
	commandChannelId: string;
	notificationChannelId: string;
	updatedAt: string;
	createdAt: string;
}

export interface CreateRepoConfigRequest {
	guildId: string;
	commandChannelId: string;
	notificationChannelId: string;
}

export interface UpdateRepoConfigRequest {
	guildId?: string;
	commandChannelId?: string;
	notificationChannelId?: string;
}

export interface RepoConfigParam {
	id: string;
}

export interface CommandChannelParam {
	commandChannelId: string;
}

export interface RepoConfigActionResponse {
	success: boolean;
	message: string;
}
