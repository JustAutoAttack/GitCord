import { eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { userSessions } from '../generated';
import { BaseRepo } from './base';

export type UserSessionEntity = InferSelectModel<typeof userSessions>;

export class UserSessionsRepo extends BaseRepo<typeof userSessions> {
	constructor(database: typeof db = db) {
		super(userSessions, database);
	}

	findByUserId(userId: string): UserSessionEntity | undefined {
		databaseLogger.debug(`Executing findByUserId with userId: ${userId}`);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.userId, userId))
			.get();

		if (!result) {
			databaseLogger.debug(`No session found for userId: ${userId}`);
		}
		return result;
	}
}

export const userSessionsRepo = new UserSessionsRepo();
