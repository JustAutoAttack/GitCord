import { eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { githubAppInstallations } from '../generated';
import { BaseRepo } from './base';

export type GithubAppInstallationEntity = InferSelectModel<
	typeof githubAppInstallations
>;

export class GithubAppInstallationsRepo extends BaseRepo<
	typeof githubAppInstallations
> {
	constructor(database: typeof db = db) {
		super(githubAppInstallations, database);
	}

	findByInstallationId(
		installationId: number
	): GithubAppInstallationEntity | undefined {
		databaseLogger.debug(
			`Executing findByInstallationId with installationId: ${installationId}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.installationId, installationId))
			.get();

		if (!result) {
			databaseLogger.debug(
				`No GitHub app installation found for installation ID: ${installationId}`
			);
		}
		return result;
	}
}

export const githubAppInstallationsRepo = new GithubAppInstallationsRepo();
