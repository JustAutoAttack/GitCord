import { and, eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { remoteConfigs } from '../generated';
import { BaseRepo } from './base';

export type RemoteConfigEntity = InferSelectModel<typeof remoteConfigs>;

export class RemoteConfigsRepo extends BaseRepo<typeof remoteConfigs> {
	constructor(database: typeof db = db) {
		super(remoteConfigs, database);
	}

	findByCommandChannelId(
		commandChannelId: string
	): RemoteConfigEntity | undefined {
		databaseLogger.debug(
			`Executing findByCommandChannelId with channelId: ${commandChannelId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.commandChannelId, commandChannelId))
			.get();

		if (!result) {
			databaseLogger.debug(
				`No repo config found for command channel id: ${commandChannelId}`
			);
		}
		return result;
	}

	findByGuildAndRepo(
		guildId: string,
		repositoryUrl: string
	): RemoteConfigEntity | undefined {
		databaseLogger.debug(
			`Executing findByGuildAndRepo with guildId: ${guildId}, repositoryUrl: ${repositoryUrl}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(
				and(
					eq(this.table.guildId, guildId),
					eq(this.table.repositoryUrl, repositoryUrl)
				)
			)
			.get();

		if (!result) {
			databaseLogger.debug(
				`No repo config found for guild: ${guildId}, repositoryUrl: ${repositoryUrl}`
			);
		}
		return result;
	}

	findByGuildId(guildId: string): RemoteConfigEntity[] {
		databaseLogger.debug(
			`Executing findByGuildId with guildId: ${guildId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.all();

		databaseLogger.debug(
			`Retrieved ${results.length} repo config(s) for guildId: ${guildId}`
		);
		return results;
	}
}

export const remoteConfigsRepo = new RemoteConfigsRepo();
