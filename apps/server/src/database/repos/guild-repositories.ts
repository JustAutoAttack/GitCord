import { and, eq } from 'drizzle-orm';

import type { GuildRepository } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { guildRepositories } from '../generated';
import { BaseRepo } from './base';
import { guildRepositoryMapper } from '../mappers';

export class GuildRepositoriesRepo extends BaseRepo<
	typeof guildRepositories,
	GuildRepository.Model,
	GuildRepository.CreateInput,
	GuildRepository.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(guildRepositories, guildRepositoryMapper, database);
	}

	findByCommandChannelId(
		commandChannelId: string
	): GuildRepository.Model | undefined {
		logger.debug(
			`Executing findByCommandChannelId with channelId: ${commandChannelId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.commandChannelId, commandChannelId))
			.get();

		if (!result) {
			logger.debug(
				`No guild repository found for command channel id: ${commandChannelId}`
			);
			return undefined;
		}
		return guildRepositoryMapper.toDomain(result);
	}

	findByGuildAndGithubRepositoryId(
		guildId: string,
		githubRepositoryId: string
	): GuildRepository.Model | undefined {
		logger.debug(
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
			logger.debug(
				`No guild repository found for guild: ${guildId}, githubRepositoryId: ${githubRepositoryId}`
			);
			return undefined;
		}
		return guildRepositoryMapper.toDomain(result);
	}

	findByGuildId(guildId: string): GuildRepository.Model[] {
		logger.debug(`Executing findByGuildId with guildId: ${guildId}`);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.guildId, guildId))
			.all();

		logger.debug(
			`Retrieved ${results.length} guild repository(s) for guildId: ${guildId}`
		);
		return guildRepositoryMapper.toDomainList(results);
	}

	findByGithubRepositoryId(
		githubRepositoryId: string
	): GuildRepository.Model[] {
		logger.debug(
			`Executing findByGithubRepositoryId with id: ${githubRepositoryId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.githubRepositoryId, githubRepositoryId))
			.all();

		logger.debug(
			`Retrieved ${results.length} guild repository(s) for github repository id: ${githubRepositoryId}`
		);
		return guildRepositoryMapper.toDomainList(results);
	}
}

export const guildRepositoriesRepo = new GuildRepositoriesRepo();
