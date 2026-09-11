import { and, eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { guildUserPermissions } from '../generated';
import { BaseRepo } from './base';

export type GuildUserPermissionEntity = InferSelectModel<
	typeof guildUserPermissions
>;

export class GuildUserPermissionsRepo extends BaseRepo<
	typeof guildUserPermissions
> {
	constructor(database: typeof db = db) {
		super(guildUserPermissions, database);
	}

	findByGuildId(guildId: string): GuildUserPermissionEntity[] {
		databaseLogger.debug(
			`Executing findByGuildId with guildId: ${guildId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.all();

		databaseLogger.debug(
			`Retrieved ${results.length} permission record(s) for guildId: ${guildId}`
		);
		return results;
	}

	findByGuildAndUser(
		guildId: string,
		discordUserId: string
	): GuildUserPermissionEntity[] {
		databaseLogger.debug(
			`Executing findByGuildAndUser with guildId: ${guildId}, discordUserId: ${discordUserId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(
				and(
					eq(this.table.guildId, guildId),
					eq(this.table.discordUserId, discordUserId)
				)
			)
			.all();

		databaseLogger.debug(
			`Retrieved ${results.length} permission record(s) for user ${discordUserId} in guild ${guildId}`
		);
		return results;
	}

	findByGuildUserAndCommand(
		guildId: string,
		discordUserId: string,
		commandId: string
	): GuildUserPermissionEntity | undefined {
		databaseLogger.debug(
			`Executing findByGuildUserAndCommand for guildId: ${guildId}, discordUserId: ${discordUserId}, commandId: ${commandId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(
				and(
					eq(this.table.guildId, guildId),
					eq(this.table.discordUserId, discordUserId),
					eq(this.table.commandId, commandId)
				)
			)
			.get();

		if (!result) {
			databaseLogger.debug(
				`No permission record found for user ${discordUserId} on command ${commandId} in guild ${guildId}`
			);
		}
		return result;
	}
}

export const guildUserPermissionsRepo = new GuildUserPermissionsRepo();
