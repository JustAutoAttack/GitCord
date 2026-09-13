import { and, eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { githubRepositories } from '../generated';
import { BaseRepo } from './base';

export type GithubRepositoryEntity = InferSelectModel<
	typeof githubRepositories
>;

export class GithubRepositoriesRepo extends BaseRepo<
	typeof githubRepositories
> {
	constructor(database: typeof db = db) {
		super(githubRepositories, database);
	}

	findByRepositoryUrl(
		repositoryUrl: string
	): GithubRepositoryEntity | undefined {
		databaseLogger.debug(
			`Executing findByRepositoryUrl with repositoryUrl: ${repositoryUrl}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.repositoryUrl, repositoryUrl))
			.get();

		if (!result) {
			databaseLogger.debug(
				`No GitHub repository found for URL: ${repositoryUrl}`
			);
		}
		return result;
	}

	findByGithubAppInstallationId(
		githubAppInstallationId: string
	): GithubRepositoryEntity[] {
		databaseLogger.debug(
			`Executing findByGithubAppInstallationId with installationId: ${githubAppInstallationId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(
				eq(this.table.githubAppInstallationId, githubAppInstallationId)
			)
			.all();

		databaseLogger.debug(
			`Retrieved ${results.length} GitHub repository(s) for installation ID: ${githubAppInstallationId}`
		);
		return results;
	}
}

export const githubRepositoriesRepo = new GithubRepositoriesRepo();
