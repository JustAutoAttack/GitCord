export namespace OAuthState {
	export type Client = 'browser' | 'tauri';

	export interface Model {
		id: string;
		stateHash: string;
		client: Client;
		browserBindingHash: string | null;
		expiresAt: string;
		consumedAt: string | null;
		createdAt: string;
	}

	export interface CreateInput {
		stateHash: string;
		client: Client;
		browserBindingHash?: string | null;
		expiresAt: string;
	}
}
