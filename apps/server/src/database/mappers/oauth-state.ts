import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import type { OAuthState } from '@domain';
import type { oauthStates } from '../generated';

export type OAuthStateRow = InferSelectModel<typeof oauthStates>;
export type OAuthStateInsert = InferInsertModel<typeof oauthStates>;

export const oauthStateMapper = {
	toDomain(raw: OAuthStateRow): OAuthState.Model {
		return {
			id: raw.id,
			stateHash: raw.stateHash,
			client: raw.client as OAuthState.Client,
			browserBindingHash: raw.browserBindingHash,
			expiresAt: raw.expiresAt,
			consumedAt: raw.consumedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: OAuthStateRow | undefined | null
	): OAuthState.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: OAuthStateRow[]): OAuthState.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: OAuthState.CreateInput): OAuthStateInsert {
		const now = new Date().toISOString();

		return {
			id: crypto.randomUUID(),
			stateHash: input.stateHash,
			client: input.client,
			browserBindingHash: input.browserBindingHash ?? null,
			expiresAt: input.expiresAt,
			consumedAt: null,
			createdAt: now
		};
	}
};
