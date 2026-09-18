import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { cryptoService } from '@core';
import type { UserSession } from '@domain';
import type { userSessions } from '../generated';

export type UserSessionRow = InferSelectModel<typeof userSessions>;
export type UserSessionInsert = InferInsertModel<typeof userSessions>;

export const userSessionMapper = {
	toDomain(raw: UserSessionRow): UserSession.Model {
		return {
			id: raw.id,
			userId: raw.userId,
			accessToken: cryptoService.decryptString(raw.accessTokenEncrypted),
			refreshTokenHash: raw.refreshTokenHash,
			expiresAt: raw.expiresAt,
			revokedAt: raw.revokedAt,
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
			accessTokenEncrypted: cryptoService.encryptString(
				input.accessToken
			),
			refreshTokenHash: input.refreshTokenHash,
			expiresAt: input.expiresAt,
			revokedAt: input.revokedAt ?? null,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(input: UserSession.UpdateInput): Partial<UserSessionInsert> {
		const update: Partial<UserSessionInsert> = {};

		if (input.userId !== undefined) {
			update.userId = input.userId;
		}

		if (input.accessToken !== undefined) {
			update.accessTokenEncrypted = cryptoService.encryptString(
				input.accessToken
			);
		}

		if (input.refreshTokenHash !== undefined) {
			update.refreshTokenHash = input.refreshTokenHash;
		}

		if (input.expiresAt !== undefined) {
			update.expiresAt = input.expiresAt;
		}

		if (input.revokedAt !== undefined) {
			update.revokedAt = input.revokedAt;
		}

		update.updatedAt = new Date().toISOString();

		return update;
	}
};
