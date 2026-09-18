export namespace DiscordSession {
	export interface Model {
		id: string;
		userId: string;
		accessToken: string;
		refreshToken: string;
		expiresAt: string;
		revokedAt: string | null;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		userId: string;
		accessToken: string;
		refreshToken: string;
		expiresAt: string;
		revokedAt?: string | null;
	}

	export interface UpdateInput {
		userId?: string;
		accessToken?: string;
		refreshToken?: string;
		expiresAt?: string;
		revokedAt?: string | null;
	}
}
