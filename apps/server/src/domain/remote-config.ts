export interface RemoteConfig {
	id: string;
	guildId: string;
	repositoryUrl: string;
	commandChannelId: string;
	notificationChannelId: string;
	updatedAt: string;
	createdAt: string;
}

export interface CreateRemoteConfigInput {
	guildId: string;
	repositoryUrl: string;
	commandChannelId: string;
	notificationChannelId: string;
}

export interface UpdateRemoteConfigInput {
	guildId?: string;
	repositoryUrl?: string;
	commandChannelId?: string;
	notificationChannelId?: string;
}
