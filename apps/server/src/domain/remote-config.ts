export namespace RemoteConfig {
	export interface Model {
		id: string;
		guildId: string;
		repositoryUrl: string;
		commandChannelId: string;
		notificationChannelId: string;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		guildId: string;
		repositoryUrl: string;
		commandChannelId: string;
		notificationChannelId: string;
	}

	export interface UpdateInput {
		guildId?: string;
		repositoryUrl?: string;
		commandChannelId?: string;
		notificationChannelId?: string;
	}
}
