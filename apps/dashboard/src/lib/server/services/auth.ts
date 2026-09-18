import type { AuthSignOutResponse } from '@gitcord/server-api';

import { ENV } from '@lib';
import { ServerService } from './base';
import { logger } from '../logger';
import { apiClient } from '../client';

export type AuthClient = 'browser' | 'tauri';

export interface IServerAuthService {
	getSignUpUrl(client: AuthClient): string;
	signOut(): Promise<boolean>;
}

export class ServerAuthService
	extends ServerService
	implements IServerAuthService
{
	/**
	 * Returns the full server URL to initiate the Discord OAuth sign-up/login flow.
	 */
	getSignUpUrl(client: AuthClient): string {
		logger.debug(`Generating Discord sign-up URL for ${client} client.`);

		const url = new URL(`${ENV.VITE_SERVER_URL}/api/v1/auth/sign-up`);
		url.searchParams.set('client', client);

		return url.toString();
	}

	/**
	 * Clears the current session for the authenticated user.
	 */
	async signOut(): Promise<boolean> {
		logger.debug('User sign out started.');

		const response = await this.executeApiCall<AuthSignOutResponse>(
			() => apiClient.POST('/api/v1/auth/sign-out'),
			'sign out'
		);

		this.validateSuccessStatus(
			response?.success ?? false,
			'Sign out response indicated failure.',
			'sign out'
		);

		logger.debug('User signed out successfully.');

		return true;
	}
}

export const serverAuthService = new ServerAuthService();
