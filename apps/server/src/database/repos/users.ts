import { eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { users } from '../generated';
import { BaseRepo } from './base';

export type UserEntity = InferSelectModel<typeof users>;

export class UsersRepo extends BaseRepo<typeof users> {
	constructor(database: typeof db = db) {
		super(users, database);
	}

	findByDiscordId(discordId: string): UserEntity | undefined {
		databaseLogger.debug(
			`Executing findByDiscordId with discordId: ${discordId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.discordId, discordId))
			.get();

		if (!result) {
			databaseLogger.debug(`No user found for discordId: ${discordId}`);
		}
		return result;
	}
}

export const usersRepo = new UsersRepo();
