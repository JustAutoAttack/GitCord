import type {
	GuildSettingResponse,
	GuildSettingItemResponse,
	CreateGuildSettingRequest,
	UpdateGuildSettingRequest,
	DeleteGuildSettingResponse
} from '@gitcord/server-api';

import { serverAPILogger } from '@core';
import { apiClient } from '../client';
import { executeApiCall } from '../utils';

export interface IServerAPIGuildSettingService {
	list(): Promise<GuildSettingResponse>;
	getById(id: string): Promise<GuildSettingItemResponse>;
	getByGuildId(guildId: string): Promise<GuildSettingItemResponse>;
	getBySystemChannelId(
		systemChannelId: string
	): Promise<GuildSettingItemResponse>;
	create(
		setting: CreateGuildSettingRequest
	): Promise<GuildSettingItemResponse>;
	update(
		id: string,
		setting: UpdateGuildSettingRequest
	): Promise<GuildSettingItemResponse>;
	delete(id: string): Promise<DeleteGuildSettingResponse>;
}

export const ServerAPIGuildSettingService: IServerAPIGuildSettingService = {
	async list(): Promise<GuildSettingResponse> {
		const data = await executeApiCall<GuildSettingResponse>(
			() => apiClient.GET('/api/v1/guild-settings'),
			'list guild settings'
		);
		serverAPILogger.debug('Successfully listed guild settings.');
		return data;
	},

	async getById(id: string): Promise<GuildSettingItemResponse> {
		const data = await executeApiCall<GuildSettingItemResponse>(
			() =>
				apiClient.GET('/api/v1/guild-settings/{id}', {
					params: { path: { id } }
				}),
			'get guild setting'
		);
		serverAPILogger.debug(
			`Successfully retrieved guild setting with ID ${id}.`
		);
		return data;
	},

	async getByGuildId(guildId: string): Promise<GuildSettingItemResponse> {
		const data = await executeApiCall<GuildSettingItemResponse>(
			() =>
				apiClient.GET('/api/v1/guild-settings/guild/{guildId}', {
					params: { path: { guildId } }
				}),
			'get guild setting by guild ID'
		);
		serverAPILogger.debug(
			`Successfully retrieved guild setting for guild ID ${guildId}.`
		);
		return data;
	},

	async getBySystemChannelId(
		systemChannelId: string
	): Promise<GuildSettingItemResponse> {
		const data = await executeApiCall<GuildSettingItemResponse>(
			() =>
				apiClient.GET(
					'/api/v1/guild-settings/system-channel/{systemChannelId}',
					{
						params: { path: { systemChannelId } }
					}
				),
			'get guild setting by system channel'
		);
		serverAPILogger.debug(
			`Successfully retrieved guild setting for system channel ${systemChannelId}.`
		);
		return data;
	},

	async create(
		setting: CreateGuildSettingRequest
	): Promise<GuildSettingItemResponse> {
		const data = await executeApiCall<GuildSettingItemResponse>(
			() =>
				apiClient.POST('/api/v1/guild-settings', {
					body: setting
				}),
			'create guild setting'
		);
		serverAPILogger.debug('Successfully created guild setting.');
		return data;
	},

	async update(
		id: string,
		setting: UpdateGuildSettingRequest
	): Promise<GuildSettingItemResponse> {
		const data = await executeApiCall<GuildSettingItemResponse>(
			() =>
				apiClient.PATCH('/api/v1/guild-settings/{id}', {
					params: { path: { id } },
					body: setting
				}),
			'update guild setting'
		);
		serverAPILogger.debug(
			`Successfully updated guild setting with ID ${id}.`
		);
		return data;
	},

	async delete(id: string): Promise<DeleteGuildSettingResponse> {
		const data = await executeApiCall<DeleteGuildSettingResponse>(
			() =>
				apiClient.DELETE('/api/v1/guild-settings/{id}', {
					params: { path: { id } }
				}),
			'delete guild setting'
		);
		serverAPILogger.debug(
			`Successfully deleted guild setting with ID ${id}.`
		);
		return data;
	}
};
