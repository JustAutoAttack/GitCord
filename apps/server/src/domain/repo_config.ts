export interface RepoConfig {
	id: string;
	guildId: string;
	commandChannelId: string;
	notificationChannelId: string;
	updatedAt: string;
	createdAt: string;
}

export interface CreateRepoConfigInput {
	guildId: string;
	commandChannelId: string;
	notificationChannelId: string;
}

export interface UpdateRepoConfigInput {
	guildId?: string;
	commandChannelId?: string;
	notificationChannelId?: string;
}
