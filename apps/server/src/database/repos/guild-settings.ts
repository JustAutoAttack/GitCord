import { eq } from 'drizzle-orm';

import type { GuildSetting } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { guildSettings } from '../generated';
import { BaseRepo } from './base';
import { guildSettingMapper } from '../mappers';

export class GuildSettingsRepo extends BaseRepo<
	typeof guildSettings,
	GuildSetting.Model,
	GuildSetting.CreateInput,
	GuildSetting.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(guildSettings, guildSettingMapper, database);
	}

	findByGuildId(guildId: string): GuildSetting.Model | undefined {
		logger.debug(`Executing findByGuildId with guildId: ${guildId}`);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.get();

		if (!result) {
			logger.debug(`No guild setting found for guildId: ${guildId}`);
			return undefined;
		}
		return guildSettingMapper.toDomain(result);
	}

	findBySystemChannelId(
		systemChannelId: string
	): GuildSetting.Model | undefined {
		logger.debug(
			`Executing findBySystemChannelId with systemChannelId: ${systemChannelId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.systemChannelId, systemChannelId))
			.get();

		if (!result) {
			logger.debug(
				`No guild setting found for system channel ID: ${systemChannelId}`
			);
			return undefined;
		}
		return guildSettingMapper.toDomain(result);
	}

	findByNotifyOnConnection(
		notifyOnConnection: boolean
	): GuildSetting.Model[] {
		const val = notifyOnConnection ? '1' : '0';
		logger.debug(
			`Executing findByNotifyOnConnection with notifyOnConnection: ${val}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.notifyOnConnection, val))
			.all();

		return guildSettingMapper.toDomainList(results);
	}
}

export const guildSettingsRepo = new GuildSettingsRepo();
