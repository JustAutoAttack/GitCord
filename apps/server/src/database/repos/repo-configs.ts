import { eq } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { repoConfigs } from '../generated';
import { BaseRepo } from './base';

export interface CreateRepoConfigData {
	id: string;
	guildId: string;
	repositoryUrl: string;
	commandChannelId: string;
	notificationChannelId: string;
}

export interface UpdateRepoConfigData {
	guildId?: string;
	repositoryUrl?: string;
	commandChannelId?: string;
	notificationChannelId?: string;
}

export class RepoConfigsRepo extends BaseRepo<typeof repoConfigs> {
	constructor(database: typeof db = db) {
		super(repoConfigs, database);
	}

	async findByCommandChannelId(commandChannelId: string) {
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

	async create(data: CreateRepoConfigData) {
		const now = new Date().toISOString();
		databaseLogger.debug(
			`Creating repo config for guild: ${data.guildId}, repo: ${data.repositoryUrl}`
		);

		return super.create({
			...data,
			createdAt: now,
			updatedAt: now
		});
	}

	async update(id: string, data: UpdateRepoConfigData) {
		databaseLogger.debug(`Updating repo config id: ${id}`);
		return super.update(id, {
			...data,
			updatedAt: new Date().toISOString()
		});
	}
}

export const repoConfigsRepo = new RepoConfigsRepo();
