import type {
	RemoteConfigResponse,
	RemoteConfigItemResponse,
	CreateRemoteConfigRequest,
	UpdateRemoteConfigRequest,
	DeleteRemoteConfigResponse
} from '@gitcord/server-api';

import { AppError, ErrorCode, serverAPILogger } from '@core';
import { apiClient } from '../client';

/**
 * Service for managing remote configurations via the remote GitCord backend server.
 */
export interface IServerAPIRemoteConfigService {
	/**
	 * Lists all remote configurations.
	 *
	 * @throws {AppError} If the server is unreachable or the request fails.
	 */
	list(): Promise<RemoteConfigResponse>;

	/**
	 * Retrieves a remote configuration by ID.
	 *
	 * @param id - The remote configuration ID.
	 * @throws {AppError} If the server is unreachable or the configuration is not found.
	 */
	getById(id: string): Promise<RemoteConfigItemResponse>;

	/**
	 * Retrieves a remote configuration by command channel ID.
	 *
	 * @param commandChannelId - The command channel ID.
	 * @throws {AppError} If the server is unreachable or the configuration is not found.
	 */
	getByCommandChannel(
		commandChannelId: string
	): Promise<RemoteConfigItemResponse>;

	/**
	 * Creates a new remote configuration.
	 *
	 * @param config - The creation payload.
	 * @throws {AppError} If the server request or validation fails.
	 */
	create(
		config: CreateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse>;

	/**
	 * Updates an existing remote configuration.
	 *
	 * @param id - The remote configuration ID.
	 * @param config - The update payload.
	 * @throws {AppError} If the server request or validation fails.
	 */
	update(
		id: string,
		config: UpdateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse>;

	/**
	 * Deletes an existing remote configuration.
	 *
	 * @param id - The remote configuration ID.
	 * @throws {AppError} If the server request fails or the configuration does not exist.
	 */
	delete(id: string): Promise<DeleteRemoteConfigResponse>;
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

export const ServerAPIRemoteConfigService: IServerAPIRemoteConfigService = {
	async list(): Promise<RemoteConfigResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/remote-configs'
			);
			validateResponseData(data, error, 'list remote configurations');

			serverAPILogger.debug('Successfully listed remote configurations.');
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getById(id: string): Promise<RemoteConfigItemResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/remote-configs/{id}',
				{
					params: {
						path: {
							id
						}
					}
				}
			);
			validateResponseData(data, error, 'get remote configuration');

			serverAPILogger.debug(
				`Successfully retrieved remote configuration with ID ${id}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getByCommandChannel(
		commandChannelId: string
	): Promise<RemoteConfigItemResponse> {
		try {
			const { data, error } = await apiClient.GET(
				'/api/v1/remote-configs/command-channel/{commandChannelId}',
				{
					params: {
						path: {
							commandChannelId
						}
					}
				}
			);
			validateResponseData(
				data,
				error,
				'get remote configuration by command channel'
			);

			serverAPILogger.debug(
				`Successfully retrieved remote configuration for command channel ${commandChannelId}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async create(
		config: CreateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse> {
		try {
			const { data, error } = await apiClient.POST(
				'/api/v1/remote-configs',
				{
					body: config
				}
			);
			validateResponseData(data, error, 'create remote configuration');

			serverAPILogger.debug('Successfully created remote configuration.');
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async update(
		id: string,
		config: UpdateRemoteConfigRequest
	): Promise<RemoteConfigItemResponse> {
		try {
			const { data, error } = await apiClient.PATCH(
				'/api/v1/remote-configs/{id}',
				{
					params: {
						path: {
							id
						}
					},
					body: config
				}
			);
			validateResponseData(data, error, 'update remote configuration');

			serverAPILogger.debug(
				`Successfully updated remote configuration with ID ${id}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async delete(id: string): Promise<DeleteRemoteConfigResponse> {
		try {
			const { data, error } = await apiClient.DELETE(
				'/api/v1/remote-configs/{id}',
				{
					params: {
						path: {
							id
						}
					}
				}
			);
			validateResponseData(data, error, 'delete remote configuration');

			serverAPILogger.debug(
				`Successfully deleted remote configuration with ID ${id}.`
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	}
};
