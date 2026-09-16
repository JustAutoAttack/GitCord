import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { UserSession } from '@domain';
import type { userSessions } from '../generated';

export type UserSessionRow = InferSelectModel<typeof userSessions>;
export type UserSessionInsert = InferInsertModel<typeof userSessions>;

export const userSessionMapper = {
	toDomain(raw: UserSessionRow): UserSession.Model {
		return {
			id: raw.id,
			userId: raw.userId,
			accessTokenEncrypted: raw.accessTokenEncrypted,
			refreshTokenEncrypted: raw.refreshTokenEncrypted,
			expiresAt: raw.expiresAt,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: UserSessionRow | undefined | null
	): UserSession.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: UserSessionRow[]): UserSession.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: UserSession.CreateInput): UserSessionInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			userId: input.userId,
			accessTokenEncrypted: input.accessTokenEncrypted,
			refreshTokenEncrypted: input.refreshTokenEncrypted,
			expiresAt: input.expiresAt,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(input: UserSession.UpdateInput): Partial<UserSessionInsert> {
		const update: Partial<UserSessionInsert> = {};
		if (input.userId !== undefined) update.userId = input.userId;
		if (input.accessTokenEncrypted !== undefined)
			update.accessTokenEncrypted = input.accessTokenEncrypted;
		if (input.refreshTokenEncrypted !== undefined)
			update.refreshTokenEncrypted = input.refreshTokenEncrypted;
		if (input.expiresAt !== undefined) update.expiresAt = input.expiresAt;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
