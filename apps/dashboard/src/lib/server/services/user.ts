import type { UserResponse, UserItemResponse } from '@gitcord/server-api';

import { logger } from '../logger';
import { apiClient } from '../client';
import { ServerService } from './base';

export interface IServerUserService {
	getUsers(): Promise<UserResponse>;
	getCurrentUser(): Promise<UserItemResponse>;
	getUserById(id: string): Promise<UserItemResponse>;
	getUserByDiscordId(discordId: string): Promise<UserItemResponse>;
}

export class ServerUserService
	extends ServerService
	implements IServerUserService
{
	async getUsers(): Promise<UserResponse> {
		logger.debug('Fetching all users.');

		const response = await this.executeApiCall<UserResponse>(
			() => apiClient.GET('/api/v1/users'),
			'fetch users'
		);

		return response;
	}

	async getCurrentUser(): Promise<UserItemResponse> {
		logger.debug('Fetching current user.');

		const response = await this.executeApiCall<UserItemResponse>(
			() => apiClient.GET('/api/v1/users/me'),
			'fetch current user'
		);

		return response;
	}

	async getUserById(id: string): Promise<UserItemResponse> {
		logger.debug(`Fetching user by ID: ${id}`);

		const response = await this.executeApiCall<UserItemResponse>(
			() =>
				apiClient.GET('/api/v1/users/{id}', {
					params: { path: { id } }
				}),
			'fetch user by id'
		);

		return response;
	}

	async getUserByDiscordId(discordId: string): Promise<UserItemResponse> {
		logger.debug(`Fetching user by Discord ID: ${discordId}`);

		const response = await this.executeApiCall<UserItemResponse>(
			() =>
				apiClient.GET('/api/v1/users/discord/{discordId}', {
					params: { path: { discordId } }
				}),
			'fetch user by discord id'
		);

		return response;
	}
}

export const serverUserService = new ServerUserService();
