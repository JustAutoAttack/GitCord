import { eq } from 'drizzle-orm';

import type { GithubAppInstallation } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { githubAppInstallations } from '../generated';
import { BaseRepo } from './base';
import { githubAppInstallationMapper } from '../mappers';

export class GithubAppInstallationsRepo extends BaseRepo<
	typeof githubAppInstallations,
	GithubAppInstallation.Model,
	GithubAppInstallation.CreateInput,
	GithubAppInstallation.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(githubAppInstallations, githubAppInstallationMapper, database);
	}

	findByInstallationId(
		installationId: number
	): GithubAppInstallation.Model | undefined {
		logger.debug(
			`Executing findByInstallationId with installationId: ${installationId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.installationId, installationId))
			.get();

		if (!result) {
			logger.debug(
				`No GitHub app installation found for installation ID: ${installationId}`
			);
			return undefined;
		}
		return githubAppInstallationMapper.toDomain(result);
	}
}

export const githubAppInstallationsRepo = new GithubAppInstallationsRepo();
