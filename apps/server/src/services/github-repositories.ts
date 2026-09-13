import { AppError, ErrorCode, appLogger } from '@core';
import { githubRepositoriesRepo } from '@database';
import type { GithubRepository } from '@domain';
import { BaseService } from './base';

export class GithubRepositoriesService extends BaseService<
	GithubRepository.Model,
	GithubRepository.CreateInput,
	GithubRepository.UpdateInput,
	typeof githubRepositoriesRepo
> {
	constructor() {
		super(githubRepositoriesRepo, 'GitHub repository');
	}

	async list(
		githubAppInstallationId?: string
	): Promise<GithubRepository.Model[]> {
		if (githubAppInstallationId) {
			appLogger.debug(
				`Fetching GitHub repositories for installation ID: ${githubAppInstallationId}`
			);
			return githubRepositoriesRepo.findByGithubAppInstallationId(
				githubAppInstallationId
			);
		}
		return super.list();
	}

	async getByRepositoryUrl(
		repositoryUrl: string
	): Promise<GithubRepository.Model | null> {
		appLogger.debug(`Fetching GitHub repository by URL: ${repositoryUrl}`);
		const result =
			githubRepositoriesRepo.findByRepositoryUrl(repositoryUrl) ?? null;
		if (!result) {
			appLogger.debug(
				`No GitHub repository found for URL: ${repositoryUrl}`
			);
		}
		return result;
	}

	async create(
		input: GithubRepository.CreateInput
	): Promise<GithubRepository.Model> {
		const existingRepo = await this.getByRepositoryUrl(input.repositoryUrl);
		if (existingRepo) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`GitHub repository [${input.repositoryUrl}] already exists.`
			);
		}

		appLogger.info(
			`Creating new GitHub repository record for: ${input.repositoryFullName} (${input.repositoryUrl})`
		);

		return super.create({
			githubAppInstallationId: input.githubAppInstallationId,
			repositoryUrl: input.repositoryUrl,
			repositoryFullName: input.repositoryFullName
		});
	}
}

export const githubRepositoriesService = new GithubRepositoriesService();
