import { eq } from 'drizzle-orm';

import type { GithubRepository } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { githubRepositories } from '../generated';
import { BaseRepo } from './base';
import { githubRepositoryMapper } from '../mappers';

export class GithubRepositoriesRepo extends BaseRepo<
	typeof githubRepositories,
	GithubRepository.Model,
	GithubRepository.CreateInput,
	GithubRepository.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(githubRepositories, githubRepositoryMapper, database);
	}

	findByRepositoryUrl(
		repositoryUrl: string
	): GithubRepository.Model | undefined {
		logger.debug(
			`Executing findByRepositoryUrl with repositoryUrl: ${repositoryUrl}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.repositoryUrl, repositoryUrl))
			.get();

		if (!result) {
			logger.debug(
				`No GitHub repository found for URL: ${repositoryUrl}`
			);
			return undefined;
		}
		return githubRepositoryMapper.toDomain(result);
	}

	findByGithubAppInstallationId(
		githubAppInstallationId: string
	): GithubRepository.Model[] {
		logger.debug(
			`Executing findByGithubAppInstallationId with installationId: ${githubAppInstallationId}`
		);
		const results = this.db
			.select()
			.from(this.table)
			.where(
				eq(this.table.githubAppInstallationId, githubAppInstallationId)
			)
			.all();

		logger.debug(
			`Retrieved ${results.length} GitHub repository(s) for installation ID: ${githubAppInstallationId}`
		);
		return githubRepositoryMapper.toDomainList(results);
	}
}

export const githubRepositoriesRepo = new GithubRepositoriesRepo();
