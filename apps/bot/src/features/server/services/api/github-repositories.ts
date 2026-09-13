import type {
	GithubRepositoryResponse,
	GithubRepositoryItemResponse,
	GithubRepositoryByLookupResponse,
	CreateGithubRepositoryRequest,
	UpdateGithubRepositoryRequest,
	DeleteGithubRepositoryResponse
} from '@gitcord/server-api';

import { serverCacheService } from '../cache';
import { logger } from '../../logger';
import { apiClient } from '../../client';
import { executeApiCall } from '../../utils';

export interface IServerAPIGithubRepositoriesService {
	list(githubAppInstallationId?: string): Promise<GithubRepositoryResponse>;
	getById(id: string): Promise<GithubRepositoryItemResponse>;
	getByRepositoryUrl(
		repositoryUrl: string
	): Promise<GithubRepositoryByLookupResponse>;
	create(
		repository: CreateGithubRepositoryRequest
	): Promise<GithubRepositoryItemResponse>;
	update(
		id: string,
		repository: UpdateGithubRepositoryRequest
	): Promise<GithubRepositoryItemResponse>;
	delete(id: string): Promise<DeleteGithubRepositoryResponse>;
}

export const ServerAPIGithubRepositoriesService: IServerAPIGithubRepositoriesService =
	{
		async list(
			githubAppInstallationId?: string
		): Promise<GithubRepositoryResponse> {
			const data = await executeApiCall<GithubRepositoryResponse>(
				() =>
					apiClient.GET('/api/v1/github-repositories', {
						params: {
							query: {
								...(githubAppInstallationId
									? { githubAppInstallationId }
									: {})
							}
						}
					}),
				'list GitHub repositories'
			);
			for (const item of data) {
				if (!serverCacheService.get('github_repositories', item.id)) {
					serverCacheService.set(
						'github_repositories',
						item.id,
						item
					);
				}
			}
			logger.debug('Successfully listed GitHub repositories.');
			return data;
		},

		async getById(id: string): Promise<GithubRepositoryItemResponse> {
			const cached = serverCacheService.get('github_repositories', id);
			if (cached) {
				logger.debug(
					`Successfully retrieved GitHub repository with ID ${id} from cache.`
				);
				return cached;
			}

			const data = await executeApiCall<GithubRepositoryItemResponse>(
				() =>
					apiClient.GET('/api/v1/github-repositories/{id}', {
						params: { path: { id } }
					}),
				'get GitHub repository'
			);
			serverCacheService.set('github_repositories', data.id, data);
			logger.debug(
				`Successfully retrieved GitHub repository with ID ${id} from server.`
			);
			return data;
		},

		async getByRepositoryUrl(
			repositoryUrl: string
		): Promise<GithubRepositoryByLookupResponse> {
			const data = await executeApiCall<GithubRepositoryByLookupResponse>(
				() =>
					apiClient.GET('/api/v1/github-repositories/lookup', {
						params: {
							query: { repositoryUrl }
						}
					}),
				'get GitHub repository by URL'
			);
			if (!serverCacheService.get('github_repositories', data.id)) {
				serverCacheService.set('github_repositories', data.id, data);
			}
			logger.debug(
				`Successfully retrieved GitHub repository for URL ${repositoryUrl}.`
			);
			return data;
		},

		async create(
			repository: CreateGithubRepositoryRequest
		): Promise<GithubRepositoryItemResponse> {
			const data = await executeApiCall<GithubRepositoryItemResponse>(
				() =>
					apiClient.POST('/api/v1/github-repositories', {
						body: repository
					}),
				'create GitHub repository'
			);
			serverCacheService.set('github_repositories', data.id, data);
			logger.debug('Successfully created GitHub repository.');
			return data;
		},

		async update(
			id: string,
			repository: UpdateGithubRepositoryRequest
		): Promise<GithubRepositoryItemResponse> {
			const data = await executeApiCall<GithubRepositoryItemResponse>(
				() =>
					apiClient.PATCH('/api/v1/github-repositories/{id}', {
						params: { path: { id } },
						body: repository
					}),
				'update GitHub repository'
			);
			serverCacheService.set('github_repositories', data.id, data);
			logger.debug(
				`Successfully updated GitHub repository with ID ${id}.`
			);
			return data;
		},

		async delete(id: string): Promise<DeleteGithubRepositoryResponse> {
			const data = await executeApiCall<DeleteGithubRepositoryResponse>(
				() =>
					apiClient.DELETE('/api/v1/github-repositories/{id}', {
						params: { path: { id } }
					}),
				'delete GitHub repository'
			);
			serverCacheService.handleTableUpdate({
				table: 'github_repositories',
				action: 'DELETE',
				record: { id } as any
			});
			logger.debug(
				`Successfully deleted GitHub repository with ID ${id}.`
			);
			return data;
		}
	};
