import type {
	HealthResponse,
	HealthLiveResponse,
	HealthReadyResponse
} from '@gitcord/server-api';

import { logger } from '../logger';
import { apiClient } from '../client';
import { ServerService } from './base';

export interface IServerHealthService {
	checkFull(): Promise<boolean>;
	checkLive(): Promise<boolean>;
	checkReady(): Promise<boolean>;
}

export class ServerHealthService
	extends ServerService
	implements IServerHealthService
{
	async checkFull(): Promise<boolean> {
		logger.debug('GitCord server full health check started.');
		const response = await this.executeApiCall<HealthResponse>(
			() => apiClient.GET('/api/health'),
			'health'
		);
		this.validateSuccessStatus(
			response.success,
			`server health failed: ${response.message}`,
			'server health check'
		);
		this.validateDatabaseCheck(response.checks);
		logger.debug('GitCord server full health check passed successfully.');
		return true;
	}

	async checkLive(): Promise<boolean> {
		logger.debug('GitCord server liveness check started.');
		const response = await this.executeApiCall<HealthLiveResponse>(
			() => apiClient.GET('/api/health/live'),
			'liveness'
		);
		this.validateSuccessStatus(
			response.success,
			`server liveness failed: ${response.message}`,
			'server liveness check'
		);
		logger.debug('GitCord server liveness check passed successfully.');
		return true;
	}

	async checkReady(): Promise<boolean> {
		logger.debug('GitCord server readiness check started.');
		const response = await this.executeApiCall<HealthReadyResponse>(
			() => apiClient.GET('/api/health/ready'),
			'readiness'
		);
		this.validateSuccessStatus(
			response.success,
			`server readiness failed: ${response.message}`,
			'server readiness check'
		);
		this.validateDatabaseCheck(response.checks);
		logger.debug('GitCord server readiness check passed successfully.');
		return true;
	}
}

export const serverHealthService = new ServerHealthService();
