// src/server-api/services/remote-config.ts
import type {
	RemoteConfigResponse,
	RemoteConfigItemResponse,
	CreateRemoteConfigRequest,
	UpdateRemoteConfigRequest,
	DeleteRemoteConfigResponse
} from '@gitcord/server-api';

import { serverAPILogger } from '@core';
import { apiClient } from '../client';
import { executeApiCall } from '../utils';

export interface IServerAPIRemoteConfigService {
	list(): Promise<RemoteConfigResponse>;
	getById(id: string): Promise<RemoteConfigItemResponse>;
	getByCommandChannel(
		commandChannelId: string
	): Promise<RemoteConfigItemResponse>;
	create(
		config: CreateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse>;
	update(
		id: string,
		config: UpdateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse>;
	delete(id: string): Promise<DeleteRemoteConfigResponse>;
}

export const ServerAPIRemoteConfigService: IServerAPIRemoteConfigService = {
	async list(): Promise<RemoteConfigResponse> {
		const data = await executeApiCall<RemoteConfigResponse>(
			() => apiClient.GET('/api/v1/remote-configs'),
			'list remote configurations'
		);
		serverAPILogger.debug('Successfully listed remote configurations.');
		return data;
	},

	async getById(id: string): Promise<RemoteConfigItemResponse> {
		const data = await executeApiCall<RemoteConfigItemResponse>(
			() =>
				apiClient.GET('/api/v1/remote-configs/{id}', {
					params: { path: { id } }
				}),
			'get remote configuration'
		);
		serverAPILogger.debug(
			`Successfully retrieved remote configuration with ID ${id}.`
		);
		return data;
	},

	async getByCommandChannel(
		commandChannelId: string
	): Promise<RemoteConfigItemResponse> {
		const data = await executeApiCall<RemoteConfigItemResponse>(
			() =>
				apiClient.GET(
					'/api/v1/remote-configs/command-channel/{commandChannelId}',
					{
						params: { path: { commandChannelId } }
					}
				),
			'get remote configuration by command channel'
		);
		serverAPILogger.debug(
			`Successfully retrieved remote configuration for command channel ${commandChannelId}.`
		);
		return data;
	},

	async create(
		config: CreateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse> {
		const data = await executeApiCall<RemoteConfigItemResponse>(
			() =>
				apiClient.POST('/api/v1/remote-configs', {
					body: config
				}),
			'create remote configuration'
		);
		serverAPILogger.debug('Successfully created remote configuration.');
		return data;
	},

	async update(
		id: string,
		config: UpdateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse> {
		const data = await executeApiCall<RemoteConfigItemResponse>(
			() =>
				apiClient.PATCH('/api/v1/remote-configs/{id}', {
					params: { path: { id } },
					body: config
				}),
			'update remote configuration'
		);
		serverAPILogger.debug(
			`Successfully updated remote configuration with ID ${id}.`
		);
		return data;
	},

	async delete(id: string): Promise<DeleteRemoteConfigResponse> {
		const data = await executeApiCall<DeleteRemoteConfigResponse>(
			() =>
				apiClient.DELETE('/api/v1/remote-configs/{id}', {
					params: { path: { id } }
				}),
			'delete remote configuration'
		);
		serverAPILogger.debug(
			`Successfully deleted remote configuration with ID ${id}.`
		);
		return data;
	}
};
