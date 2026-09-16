import { and, eq } from 'drizzle-orm';

import type { GuildUserPermission } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { guildUserPermissions } from '../generated';
import { BaseRepo } from './base';
import { guildUserPermissionMapper } from '../mappers';

export class GuildUserPermissionsRepo extends BaseRepo<
	typeof guildUserPermissions,
	GuildUserPermission.Model,
	GuildUserPermission.CreateInput,
	GuildUserPermission.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(guildUserPermissions, guildUserPermissionMapper, database);
	}

	findByGuildId(guildId: string): GuildUserPermission.Model[] {
		logger.debug(`Executing findByGuildId with guildId: ${guildId}`);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.all();

		logger.debug(
			`Retrieved ${results.length} permission record(s) for guildId: ${guildId}`
		);
		return guildUserPermissionMapper.toDomainList(results);
	}

	findByGuildAndUser(
		guildId: string,
		discordUserId: string
	): GuildUserPermission.Model[] {
		logger.debug(
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

		logger.debug(
			`Retrieved ${results.length} permission record(s) for user ${discordUserId} in guild ${guildId}`
		);
		return guildUserPermissionMapper.toDomainList(results);
	}

	findByGuildUserAndCommand(
		guildId: string,
		discordUserId: string,
		commandId: string
	): GuildUserPermission.Model | undefined {
		logger.debug(
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
			logger.debug(
				`No permission record found for user ${discordUserId} on command ${commandId} in guild ${guildId}`
			);
			return undefined;
		}
		return guildUserPermissionMapper.toDomain(result);
	}
}

export const guildUserPermissionsRepo = new GuildUserPermissionsRepo();
