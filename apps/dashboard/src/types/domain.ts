// ===
// Discord
// ===

export interface DiscordUser {
	id: string;
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

export interface DiscordChannel {
	id: string;
}

// ===
// GitCord
// ===

export interface User {
	id: string;
	discordId: DiscordUser['id'];
	displayName: string;
	avatarUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface BotCommand {
	id: string;
	commandName: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface GithubAppInstallation {
	id: string;
	installationId: number;
	accountLogin: string;
	accountType: string;
	updatedAt: Date;
	createdAt: Date;
}

export interface GithubRepository {
	id: string;
	githubAppInstallationId: GithubAppInstallation['id'];
	repositoryUrl: string;
	repositoryFullName: string;
	updatedAt: Date;
	createdAt: Date;
}

export interface GuildSetting {
	id: string;
	guildId: DiscordGuild['id'];
	systemChannelId: DiscordChannel['id'];
	notifyOnConnection: boolean;
	updatedAt: Date;
	createdAt: Date;
}

export interface GuildRepository {
	id: string;
	guildId: DiscordGuild['id'];
	githubRepositoryId: GithubRepository['id'];
	commandChannelId: DiscordChannel['id'];
	notificationChannelId: DiscordChannel['id'];
	updatedAt: Date;
	createdAt: Date;
}

export interface GuildUserPermission {
	id: string;
	guildId: DiscordGuild['id'];
	discordUserId: DiscordUser['id'];
	commandId: BotCommand['id'];
	updatedAt: Date;
	createdAt: Date;
}
