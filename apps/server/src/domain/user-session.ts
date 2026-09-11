export namespace UserSession {
	export interface Model {
		id: string;
		userId: string;
		accessTokenEncrypted: string;
		refreshTokenEncrypted: string;
		expiresAt: string;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		userId: string;
		accessTokenEncrypted: string;
		refreshTokenEncrypted: string;
		expiresAt: string;
	}

	export interface UpdateInput {
		userId?: string;
		accessTokenEncrypted?: string;
		refreshTokenEncrypted?: string;
		expiresAt?: string;
	}
}
