import type {
	GuildSettingResponse,
	GuildSettingItemResponse,
	CreateGuildSettingRequest,
	UpdateGuildSettingRequest,
	DeleteGuildSettingResponse
} from '@gitcord/server-api';

import { AppError, ErrorCode, serverAPILogger } from '@core';
import { apiClient } from '../client';

/**
 * Service for managing guild settings via the remote GitCord backend server.
 */
export interface IServerAPIGuildSettingService {
	/**
	 * Lists all guild settings.
	 *
	 * @throws {AppError} If the server is unreachable or the request fails.
	 */
	list(): Promise<GuildSettingResponse>;

	/**
	 * Retrieves a guild setting by ID.
	 *
	 * @param id - The guild setting ID.
	 * @throws {AppError} If the server is unreachable or the setting is not found.
	 */
	getById(id: string): Promise<GuildSettingItemResponse>;

	/**
	 * Retrieves a guild setting by guild ID.
	 *
	 * @param guildId - The guild ID.
	 * @throws {AppError} If the server is unreachable or the setting is not found.
	 */
	getByGuildId(guildId: string): Promise<GuildSettingItemResponse>;

	/**
	 * Retrieves a guild setting by system channel ID.
	 *
	 * @param systemChannelId - The system channel ID.
	 * @throws {AppError} If the server is unreachable or the setting is not found.
	 */
	getBySystemChannelId(
		systemChannelId: string
	): Promise<GuildSettingItemResponse>;

	/**
	 * Creates a new guild setting.
	 *
	 * @param setting - The creation payload.
	 * @throws {AppError} If the server request or validation fails.
	 */
	create(
		setting: CreateGuildSettingRequest
	): Promise<GuildSettingItemResponse>;

	/**
	 * Updates an existing guild setting.
	 *
	 * @param id - The guild setting ID.
	 * @param setting - The update payload.
	 * @throws {AppError} If the server request or validation fails.
	 */
	update(
		id: string,
		setting: UpdateGuildSettingRequest
	): Promise<GuildSettingItemResponse>;

	/**
	 * Deletes an existing guild setting.
	 *
	 * @param id - The guild setting ID.
	 * @throws {AppError} If the server request fails or the setting does not exist.
	 */
	delete(id: string): Promise<DeleteGuildSettingResponse>;
}

function handleConnectionError(error: unknown): never {
	if (error instanceof AppError) {
		throw error;
	}
	throw new AppError(
		ErrorCode.SERVER_API_ERROR,
		'Failed to connect to GitCord server.'
	);
}

function validateResponseData<T>(
	data: T | undefined,
	error: unknown,
	contextName: string
): asserts data is T {
	if (error) {
		throw new AppError(
			ErrorCode.SERVER_API_ERROR,
			`GitCord ${contextName} request failed.`
		);
	}

	if (!data) {
		throw new AppError(
			ErrorCode.SERVER_API_ERROR,
			`GitCord server returned an invalid ${contextName} response.`
		);
	}
}

export const ServerAPIGuildSettingService: IServerAPIGuildSettingService = {
	async list(): Promise<GuildSettingResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/guild-settings'
			);
			validateResponseData(data, error, 'list guild settings');

			serverAPILogger.debug('Successfully listed guild settings.');
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getById(id: string): Promise<GuildSettingItemResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/guild-settings/{id}',
				{
					params: {
						path: {
							id
						}
					}
				}
			);
			validateResponseData(data, error, 'get guild setting');

			serverAPILogger.debug(
				`Successfully retrieved guild setting with ID ${id}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getByGuildId(guildId: string): Promise<GuildSettingItemResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/guild-settings/guild/{guildId}',
				{
					params: {
						path: {
							guildId
						}
					}
				}
			);
			validateResponseData(data, error, 'get guild setting by guild ID');

			serverAPILogger.debug(
				`Successfully retrieved guild setting for guild ID ${guildId}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getBySystemChannelId(
		systemChannelId: string
	): Promise<GuildSettingItemResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/guild-settings/system-channel/{systemChannelId}',
				{
					params: {
						path: {
							systemChannelId
						}
					}
				}
			);
			validateResponseData(
				data,
				error,
				'get guild setting by system channel'
			);

			serverAPILogger.debug(
				`Successfully retrieved guild setting for system channel ${systemChannelId}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async create(
		setting: CreateGuildSettingRequest
	): Promise<GuildSettingItemResponse> {
		try {
			const { data, error } = await apiClient.POST(
				'/api/v1/guild-settings',
				{
					body: setting
				}
			);
			validateResponseData(data, error, 'create guild setting');

			serverAPILogger.debug('Successfully created guild setting.');
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async update(
		id: string,
		setting: UpdateGuildSettingRequest
	): Promise<GuildSettingItemResponse> {
		try {
			const { data, error } = await apiClient.PATCH(
				'/api/v1/guild-settings/{id}',
				{
					params: {
						path: {
							id
						}
					},
					body: setting
				}
			);
			validateResponseData(data, error, 'update guild setting');

			serverAPILogger.debug(
				`Successfully updated guild setting with ID ${id}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async delete(id: string): Promise<DeleteGuildSettingResponse> {
		try {
			const { data, error } = await apiClient.DELETE(
				'/api/v1/guild-settings/{id}',
				{
					params: {
						path: {
							id
						}
					}
				}
			);
			validateResponseData(data, error, 'delete guild setting');

			serverAPILogger.debug(
				`Successfully deleted guild setting with ID ${id}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	}
};
