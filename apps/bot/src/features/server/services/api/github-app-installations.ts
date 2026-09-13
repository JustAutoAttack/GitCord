import type {
	GithubAppInstallationResponse,
	GithubAppInstallationItemResponse,
	GithubAppInstallationByInstallationIdResponse,
	CreateGithubAppInstallationRequest,
	UpdateGithubAppInstallationRequest,
	DeleteGithubAppInstallationResponse
} from '@gitcord/server-api';

import { serverCacheService } from '../cache';
import { logger } from '../../logger';
import { apiClient } from '../../client';
import { executeApiCall } from '../../utils';

export interface IServerAPIGithubAppInstallationsService {
	list(): Promise<GithubAppInstallationResponse>;
	getById(id: string): Promise<GithubAppInstallationItemResponse>;
	getByInstallationId(
		installationId: number
	): Promise<GithubAppInstallationByInstallationIdResponse>;
	create(
		installation: CreateGithubAppInstallationRequest
	): Promise<GithubAppInstallationItemResponse>;
	update(
		id: string,
		installation: UpdateGithubAppInstallationRequest
	): Promise<GithubAppInstallationItemResponse>;
	delete(id: string): Promise<DeleteGithubAppInstallationResponse>;
}

export const ServerAPIGithubAppInstallationsService: IServerAPIGithubAppInstallationsService =
	{
		async list(): Promise<GithubAppInstallationResponse> {
			const data = await executeApiCall<GithubAppInstallationResponse>(
				() => apiClient.GET('/api/v1/github-app-installations'),
				'list GitHub app installations'
			);
			for (const item of data) {
				if (
					!serverCacheService.get('github_app_installations', item.id)
				) {
					serverCacheService.set(
						'github_app_installations',
						item.id,
						item
					);
				}
			}
			logger.debug('Successfully listed GitHub app installations.');
			return data;
		},

		async getById(id: string): Promise<GithubAppInstallationItemResponse> {
			const cached = serverCacheService.get(
				'github_app_installations',
				id
			);
			if (cached) {
				logger.debug(
					`Successfully retrieved GitHub app installation with ID ${id} from cache.`
				);
				return cached;
			}

			const data =
				await executeApiCall<GithubAppInstallationItemResponse>(
					() =>
						apiClient.GET('/api/v1/github-app-installations/{id}', {
							params: { path: { id } }
						}),
					'get GitHub app installation'
				);
			serverCacheService.set('github_app_installations', data.id, data);
			logger.debug(
				`Successfully retrieved GitHub app installation with ID ${id} from server.`
			);
			return data;
		},

		async getByInstallationId(
			installationId: number
		): Promise<GithubAppInstallationByInstallationIdResponse> {
			// If tracking by secondary keys is needed, you could check an index map,
			// but hitting the server or querying by known ID is standard here.
			const data =
				await executeApiCall<GithubAppInstallationByInstallationIdResponse>(
					() =>
						apiClient.GET(
							'/api/v1/github-app-installations/installation/{installationId}',
							{
								params: {
									path: {
										installationId: String(installationId)
									}
								}
							}
						),
					'get GitHub app installation by installation ID'
				);

			if (!serverCacheService.get('github_app_installations', data.id)) {
				serverCacheService.set(
					'github_app_installations',
					data.id,
					data
				);
			}

			logger.debug(
				`Successfully retrieved GitHub app installation for installation ID ${installationId}.`
			);
			return data;
		},

		async create(
			installation: CreateGithubAppInstallationRequest
		): Promise<GithubAppInstallationItemResponse> {
			const data =
				await executeApiCall<GithubAppInstallationItemResponse>(
					() =>
						apiClient.POST('/api/v1/github-app-installations', {
							body: installation
						}),
					'create GitHub app installation'
				);
			serverCacheService.set('github_app_installations', data.id, data);
			logger.debug('Successfully created GitHub app installation.');
			return data;
		},

		async update(
			id: string,
			installation: UpdateGithubAppInstallationRequest
		): Promise<GithubAppInstallationItemResponse> {
			const data =
				await executeApiCall<GithubAppInstallationItemResponse>(
					() =>
						apiClient.PATCH(
							'/api/v1/github-app-installations/{id}',
							{
								params: { path: { id } },
								body: installation
							}
						),
					'update GitHub app installation'
				);
			serverCacheService.set('github_app_installations', data.id, data);
			logger.debug(
				`Successfully updated GitHub app installation with ID ${id}.`
			);
			return data;
		},

		async delete(id: string): Promise<DeleteGithubAppInstallationResponse> {
			const data =
				await executeApiCall<DeleteGithubAppInstallationResponse>(
					() =>
						apiClient.DELETE(
							'/api/v1/github-app-installations/{id}',
							{
								params: { path: { id } }
							}
						),
					'delete GitHub app installation'
				);
			serverCacheService.handleTableUpdate({
				table: 'github_app_installations',
				action: 'DELETE',
				record: { id } as any
			});
			logger.debug(
				`Successfully deleted GitHub app installation with ID ${id}.`
			);
			return data;
		}
	};
