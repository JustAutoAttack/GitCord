import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { GuildUserPermission } from '@domain';
import type { guildUserPermissions } from '../generated';

export type GuildUserPermissionRow = InferSelectModel<
	typeof guildUserPermissions
>;
export type GuildUserPermissionInsert = InferInsertModel<
	typeof guildUserPermissions
>;

export const guildUserPermissionMapper = {
	toDomain(raw: GuildUserPermissionRow): GuildUserPermission.Model {
		return {
			id: raw.id,
			guildId: raw.guildId,
			discordUserId: raw.discordUserId,
			commandId: raw.commandId,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: GuildUserPermissionRow | undefined | null
	): GuildUserPermission.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: GuildUserPermissionRow[]): GuildUserPermission.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(
		input: GuildUserPermission.CreateInput
	): GuildUserPermissionInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			guildId: input.guildId,
			discordUserId: input.discordUserId,
			commandId: input.commandId,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(
		input: GuildUserPermission.UpdateInput
	): Partial<GuildUserPermissionInsert> {
		const update: Partial<GuildUserPermissionInsert> = {};
		if (input.guildId !== undefined) update.guildId = input.guildId;
		if (input.discordUserId !== undefined)
			update.discordUserId = input.discordUserId;
		if (input.commandId !== undefined) update.commandId = input.commandId;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
