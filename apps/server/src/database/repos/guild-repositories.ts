import { and, eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { guildRepositories } from '../generated';
import { BaseRepo } from './base';

export type GuildRepositoryEntity = InferSelectModel<typeof guildRepositories>;

export class GuildRepositoriesRepo extends BaseRepo<typeof guildRepositories> {
	constructor(database: typeof db = db) {
		super(guildRepositories, database);
	}

	findByCommandChannelId(
		commandChannelId: string
	): GuildRepositoryEntity | undefined {
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
				`No guild repository found for command channel id: ${commandChannelId}`
			);
		}
		return result;
	}

	findByGuildAndGithubRepositoryId(
		guildId: string,
		githubRepositoryId: string
	): GuildRepositoryEntity | undefined {
		databaseLogger.debug(
			`Executing findByGuildAndGithubRepositoryId with guildId: ${guildId}, githubRepositoryId: ${githubRepositoryId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(
				and(
					eq(this.table.guildId, guildId),
					eq(this.table.githubRepositoryId, githubRepositoryId)
				)
			)
			.get();

		if (!result) {
			databaseLogger.debug(
				`No guild repository found for guild: ${guildId}, githubRepositoryId: ${githubRepositoryId}`
			);
		}
		return result;
	}

	findByGuildId(guildId: string): GuildRepositoryEntity[] {
		databaseLogger.debug(
			`Executing findByGuildId with guildId: ${guildId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.all();

		databaseLogger.debug(
			`Retrieved ${results.length} guild repository(s) for guildId: ${guildId}`
		);
		return results;
	}

	findByGithubRepositoryId(
		githubRepositoryId: string
	): GuildRepositoryEntity[] {
		databaseLogger.debug(
			`Executing findByGithubRepositoryId with id: ${githubRepositoryId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.githubRepositoryId, githubRepositoryId))
			.all();

		databaseLogger.debug(
			`Retrieved ${results.length} guild repository(s) for github repository id: ${githubRepositoryId}`
		);
		return results;
	}
}

export const guildRepositoriesRepo = new GuildRepositoriesRepo();
