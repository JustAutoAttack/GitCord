export namespace UserSession {
	export interface Model {
		id: string;
		userId: string;
		accessToken: string;
		refreshTokenHash: string;
		expiresAt: string;
		revokedAt: string | null;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		userId: string;
		accessToken: string;
		refreshTokenHash: string;
		expiresAt: string;
		revokedAt?: string | null;
	}

	export interface UpdateInput {
		userId?: string;
		accessToken?: string;
		refreshTokenHash?: string;
		expiresAt?: string;
		revokedAt?: string | null;
	}
}
