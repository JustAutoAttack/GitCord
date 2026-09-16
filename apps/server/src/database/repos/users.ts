import { eq } from 'drizzle-orm';

import type { User } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { users } from '../generated';
import { BaseRepo } from './base';
import { userMapper } from '../mappers';

export class UsersRepo extends BaseRepo<
	typeof users,
	User.Model,
	User.CreateInput,
	User.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(users, userMapper, database);
	}

	findByDiscordId(discordId: string): User.Model | undefined {
		logger.debug(`Executing findByDiscordId with discordId: ${discordId}`);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.discordId, discordId))
			.get();

		if (!result) {
			logger.debug(`No user found for discordId: ${discordId}`);
			return undefined;
		}
		return userMapper.toDomain(result);
	}
}

export const usersRepo = new UsersRepo();
