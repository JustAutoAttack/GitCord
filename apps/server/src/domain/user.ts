export namespace User {
	export interface Model {
		id: string;
		discordId: string;
		displayName: string;
		avatarUrl: string | null;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		discordId: string;
		displayName: string;
		avatarUrl?: string | null;
	}

	export interface UpdateInput {
		discordId?: string;
		displayName?: string;
		avatarUrl?: string | null;
	}
}
