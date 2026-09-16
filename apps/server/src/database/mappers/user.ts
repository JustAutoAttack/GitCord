import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { User } from '@domain';
import type { users } from '../generated';

export type UserRow = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;

export const userMapper = {
	toDomain(raw: UserRow): User.Model {
		return {
			id: raw.id,
			discordId: raw.discordId,
			displayName: raw.displayName,
			avatarUrl: raw.avatarUrl,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(raw: UserRow | undefined | null): User.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: UserRow[]): User.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: User.CreateInput): UserInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			discordId: input.discordId,
			displayName: input.displayName,
			avatarUrl: input.avatarUrl ?? null,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(input: User.UpdateInput): Partial<UserInsert> {
		const update: Partial<UserInsert> = {};
		if (input.discordId !== undefined) update.discordId = input.discordId;
		if (input.displayName !== undefined)
			update.displayName = input.displayName;
		if (input.avatarUrl !== undefined) update.avatarUrl = input.avatarUrl;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
