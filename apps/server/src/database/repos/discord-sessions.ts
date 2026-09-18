import { eq } from 'drizzle-orm';

import type { DiscordSession } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { discordSessions } from '../generated';
import { BaseRepo } from './base';
import { discordSessionMapper } from '../mappers';

export class DiscordSessionsRepo extends BaseRepo<
	typeof discordSessions,
	DiscordSession.Model,
	DiscordSession.CreateInput,
	DiscordSession.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(discordSessions, discordSessionMapper, database);
	}

	findByUserId(userId: string): DiscordSession.Model | undefined {
		logger.debug(`Executing findByUserId with userId: ${userId}`);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.userId, userId))
			.get();

		if (!result) {
			logger.debug(`No discord session found for userId: ${userId}`);
			return undefined;
		}
		return discordSessionMapper.toDomain(result);
	}
}

export const discordSessionsRepo = new DiscordSessionsRepo();
