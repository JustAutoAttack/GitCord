export interface User {
	id: string;
	discordId: string;
	displayName: string;
	avatarUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserSession {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}

export interface GithubAppInstallation {
	id: string;
	installationId: string;
	accountLogin: string;
	accountType: string;
	targetType: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface GuildRepository {
	id: string;
	guildId: string;
	repositoryId: string;
	commandChannelId: string | null;
	isActive: boolean;
	createdAt: Date;
}

export interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: string;
	isBotConnected: boolean;
	userRole: string;
}
