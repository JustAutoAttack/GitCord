import { eq } from 'drizzle-orm';

import type { UserSession } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { userSessions } from '../generated';
import { BaseRepo } from './base';
import { userSessionMapper } from '../mappers';

export class UserSessionsRepo extends BaseRepo<
	typeof userSessions,
	UserSession.Model,
	UserSession.CreateInput,
	UserSession.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(userSessions, userSessionMapper, database);
	}

	findByUserId(userId: string): UserSession.Model | undefined {
		logger.debug(`Executing findByUserId with userId: ${userId}`);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.userId, userId))
			.get();

		if (!result) {
			logger.debug(`No session found for userId: ${userId}`);
			return undefined;
		}
		return userSessionMapper.toDomain(result);
	}
}

export const userSessionsRepo = new UserSessionsRepo();
