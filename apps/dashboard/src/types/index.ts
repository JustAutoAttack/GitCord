export interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: string;
	isBotConnected: boolean;
	userRole?: 'Owner' | 'Manager' | 'Member';
}

export interface UserSession {
	id: string;
	discordId: string;
	displayName: string;
	avatarUrl: string | null;
}
