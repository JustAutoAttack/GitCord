import { and, eq, gt, isNull, lt } from 'drizzle-orm';

import type { OAuthState } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { oauthStates } from '../generated';
import { BaseRepo } from './base';
import { oauthStateMapper } from '../mappers';

export class OAuthStatesRepo extends BaseRepo<
	typeof oauthStates,
	OAuthState.Model,
	OAuthState.CreateInput,
	never
> {
	constructor(database: typeof db = db) {
		super(oauthStates, oauthStateMapper, database);
	}

	findByStateHash(stateHash: string): OAuthState.Model | undefined {
		logger.debug('Executing findByStateHash for OAuth state');

		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.stateHash, stateHash))
			.get();

		if (!result) {
			logger.debug('No OAuth state found');
			return undefined;
		}

		return oauthStateMapper.toDomain(result);
	}

	consume(
		stateHash: string,
		now: string,
		browserBindingHash?: string | null
	): OAuthState.Model | undefined {
		logger.debug('Attempting to consume OAuth state');

		const conditions = [
			eq(this.table.stateHash, stateHash),
			isNull(this.table.consumedAt),
			gt(this.table.expiresAt, now)
		];

		if (browserBindingHash !== undefined) {
			conditions.push(
				browserBindingHash === null
					? isNull(this.table.browserBindingHash)
					: eq(this.table.browserBindingHash, browserBindingHash)
			);
		}

		const result = this.db
			.update(this.table)
			.set({
				consumedAt: now
			})
			.where(and(...conditions))
			.returning()
			.get();

		if (!result) {
			logger.debug('OAuth state could not be consumed');
			return undefined;
		}

		logger.debug('OAuth state successfully consumed');

		return oauthStateMapper.toDomain(result);
	}

	deleteExpired(now: string): void {
		logger.debug('Deleting expired OAuth states');

		this.db.delete(this.table).where(lt(this.table.expiresAt, now)).run();
	}
}

export const oauthStatesRepo = new OAuthStatesRepo();
