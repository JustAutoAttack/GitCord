import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { cryptoService } from '@core';
import type { DiscordSession } from '@domain';
import type { discordSessions } from '../generated';

export type DiscordSessionRow = InferSelectModel<typeof discordSessions>;
export type DiscordSessionInsert = InferInsertModel<typeof discordSessions>;

export const discordSessionMapper = {
	toDomain(raw: DiscordSessionRow): DiscordSession.Model {
		return {
			id: raw.id,
			userId: raw.userId,
			accessToken: cryptoService.decryptString(raw.accessTokenEncrypted),
			refreshToken: cryptoService.decryptString(raw.refreshTokenEncrypted),
			expiresAt: raw.expiresAt,
			revokedAt: raw.revokedAt,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: DiscordSessionRow | undefined | null
	): DiscordSession.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: DiscordSessionRow[]): DiscordSession.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: DiscordSession.CreateInput): DiscordSessionInsert {
		const now = new Date().toISOString();

		return {
			id: crypto.randomUUID(),
			userId: input.userId,
			accessTokenEncrypted: cryptoService.encryptString(
				input.accessToken
			),
			refreshTokenEncrypted: cryptoService.encryptString(
				input.refreshToken
			),
			expiresAt: input.expiresAt,
			revokedAt: input.revokedAt ?? null,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(input: DiscordSession.UpdateInput): Partial<DiscordSessionInsert> {
		const update: Partial<DiscordSessionInsert> = {};

		if (input.userId !== undefined) {
			update.userId = input.userId;
		}

		if (input.accessToken !== undefined) {
			update.accessTokenEncrypted = cryptoService.encryptString(
				input.accessToken
			);
		}

		if (input.refreshToken !== undefined) {
			update.refreshTokenEncrypted = cryptoService.encryptString(
				input.refreshToken
			);
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
