import { eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { guildSettings } from '../generated';
import { BaseRepo } from './base';

export type GuildSettingEntity = InferSelectModel<typeof guildSettings>;

export class GuildSettingsRepo extends BaseRepo<typeof guildSettings> {
	constructor(database: typeof db = db) {
		super(guildSettings, database);
	}

	findByGuildId(guildId: string): GuildSettingEntity | undefined {
		databaseLogger.debug(
			`Executing findByGuildId with guildId: ${guildId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.get();

		if (!result) {
			databaseLogger.debug(
				`No guild setting found for guildId: ${guildId}`
			);
		}
		return result;
	}

	findBySystemChannelId(
		systemChannelId: string
	): GuildSettingEntity | undefined {
		databaseLogger.debug(
			`Executing findBySystemChannelId with systemChannelId: ${systemChannelId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.systemChannelId, systemChannelId))
			.get();

		if (!result) {
			databaseLogger.debug(
				`No guild setting found for systemChannelId: ${systemChannelId}`
			);
		}
		return result;
	}
}

export const guildSettingsRepo = new GuildSettingsRepo();
