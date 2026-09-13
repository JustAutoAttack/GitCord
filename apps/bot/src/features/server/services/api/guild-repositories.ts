import type {
	GuildRepositoryResponse,
	GuildRepositoryItemResponse,
	CreateGuildRepositoryRequest,
	UpdateGuildRepositoryRequest,
	DeleteGuildRepositoryResponse
} from '@gitcord/server-api';

import { serverCacheService } from '../cache';
import { logger } from '../../logger';
import { apiClient } from '../../client';
import { executeApiCall } from '../../utils';

export interface IServerAPIGuildRepositoriesService {
	list(
		guildId?: string,
		githubRepositoryId?: string
	): Promise<GuildRepositoryResponse>;
	getById(id: string): Promise<GuildRepositoryItemResponse>;
	getByCommandChannel(
		commandChannelId: string
	): Promise<GuildRepositoryItemResponse>;
	getByGuildAndGithubRepository(
		guildId: string,
		githubRepositoryId: string
	): Promise<GuildRepositoryItemResponse>;
	create(
		config: CreateGuildRepositoryRequest
	): Promise<GuildRepositoryItemResponse>;
	update(
		id: string,
		config: UpdateGuildRepositoryRequest
	): Promise<GuildRepositoryItemResponse>;
	delete(id: string): Promise<DeleteGuildRepositoryResponse>;
}

export const ServerAPIGuildRepositoriesService: IServerAPIGuildRepositoriesService =
	{
		async list(
			guildId?: string,
			githubRepositoryId?: string
		): Promise<GuildRepositoryResponse> {
			const data = await executeApiCall<GuildRepositoryResponse>(
				() =>
					apiClient.GET('/api/v1/guild-repositories', {
						params: {
							query: {
								...(guildId ? { guildId } : {}),
								...(githubRepositoryId
									? { githubRepositoryId }
									: {})
							}
						}
					}),
				'list guild repositories'
			);
			for (const item of data) {
				if (!serverCacheService.get('guild_repositories', item.id)) {
					serverCacheService.set('guild_repositories', item.id, item);
				}
			}
			logger.debug('Successfully listed guild repositories.');
			return data;
		},

		async getById(id: string): Promise<GuildRepositoryItemResponse> {
			const cached = serverCacheService.get('guild_repositories', id);
			if (cached) {
				logger.debug(
					`Successfully retrieved guild repository with ID ${id} from cache.`
				);
				return cached;
			}

			const data = await executeApiCall<GuildRepositoryItemResponse>(
				() =>
					apiClient.GET('/api/v1/guild-repositories/{id}', {
						params: { path: { id } }
					}),
				'get guild repository'
			);
			serverCacheService.set('guild_repositories', data.id, data);
			logger.debug(
				`Successfully retrieved guild repository with ID ${id} from server.`
			);
			return data;
		},

		async getByCommandChannel(
			commandChannelId: string
		): Promise<GuildRepositoryItemResponse> {
			const data = await executeApiCall<GuildRepositoryItemResponse>(
				() =>
					apiClient.GET(
						'/api/v1/guild-repositories/command-channel/{commandChannelId}',
						{
							params: { path: { commandChannelId } }
						}
					),
				'get guild repository by command channel'
			);
			if (!serverCacheService.get('guild_repositories', data.id)) {
				serverCacheService.set('guild_repositories', data.id, data);
			}
			logger.debug(
				`Successfully retrieved guild repository for command channel ${commandChannelId}.`
			);
			return data;
		},

		async getByGuildAndGithubRepository(
			guildId: string,
			githubRepositoryId: string
		): Promise<GuildRepositoryItemResponse> {
			const data = await executeApiCall<GuildRepositoryItemResponse>(
				() =>
					apiClient.GET('/api/v1/guild-repositories/lookup', {
						params: {
							query: { guildId, githubRepositoryId }
						}
					}),
				'get guild repository by guild and GitHub repository ID'
			);
			if (!serverCacheService.get('guild_repositories', data.id)) {
				serverCacheService.set('guild_repositories', data.id, data);
			}
			logger.debug(
				`Successfully retrieved guild repository for guild ${guildId} and repo ID ${githubRepositoryId}.`
			);
			return data;
		},

		async create(
			config: CreateGuildRepositoryRequest
		): Promise<GuildRepositoryItemResponse> {
			const data = await executeApiCall<GuildRepositoryItemResponse>(
				() =>
					apiClient.POST('/api/v1/guild-repositories', {
						body: config
					}),
				'create guild repository'
			);
			serverCacheService.set('guild_repositories', data.id, data);
			logger.debug('Successfully created guild repository.');
			return data;
		},

		async update(
			id: string,
			config: UpdateGuildRepositoryRequest
		): Promise<GuildRepositoryItemResponse> {
			const data = await executeApiCall<GuildRepositoryItemResponse>(
				() =>
					apiClient.PATCH('/api/v1/guild-repositories/{id}', {
						params: { path: { id } },
						body: config
					}),
				'update guild repository'
			);
			serverCacheService.set('guild_repositories', data.id, data);
			logger.debug(
				`Successfully updated guild repository with ID ${id}.`
			);
			return data;
		},

		async delete(id: string): Promise<DeleteGuildRepositoryResponse> {
			const data = await executeApiCall<DeleteGuildRepositoryResponse>(
				() =>
					apiClient.DELETE('/api/v1/guild-repositories/{id}', {
						params: { path: { id } }
					}),
				'delete guild repository'
			);
			serverCacheService.handleTableUpdate({
				table: 'guild_repositories',
				action: 'DELETE',
				record: { id } as any
			});
			logger.debug(
				`Successfully deleted guild repository with ID ${id}.`
			);
			return data;
		}
	};
