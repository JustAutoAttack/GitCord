import { eq } from 'drizzle-orm';

import { db } from '../client';
import { repoConfigs } from '../generated';
import { BaseRepo } from './base';

export interface CreateRepoConfigData {
	id: string;
	guildId: string;
	commandChannelId: string;
	notificationChannelId: string;
}

export interface UpdateRepoConfigData {
	guildId?: string;
	commandChannelId?: string;
	notificationChannelId?: string;
}

export class RepoConfigsRepo extends BaseRepo<typeof repoConfigs> {
	constructor(database: typeof db = db) {
		super(repoConfigs, database);
	}

	async findByCommandChannelId(commandChannelId: string) {
		return this.db
			.select()
			.from(this.table)
			.where(eq(this.table.commandChannelId, commandChannelId))
			.get();
	}

	async create(data: CreateRepoConfigData) {
		const now = new Date().toISOString();

		return super.create({
			...data,
			createdAt: now,
			updatedAt: now
		});
	}

	async update(id: string, data: UpdateRepoConfigData) {
		return super.update(id, {
			...data,
			updatedAt: new Date().toISOString()
		});
	}
}

export const repoConfigsRepo = new RepoConfigsRepo();
