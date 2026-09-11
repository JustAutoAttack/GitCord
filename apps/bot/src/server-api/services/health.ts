// src/server-api/services/health.ts
import type {
	HealthResponse,
	HealthLiveResponse,
	HealthReadyResponse
} from '@gitcord/server-api';

import { AppError, ErrorCode, serverAPILogger } from '@core';
import { apiClient } from '../client';
import { executeApiCall } from '../utils';

export interface IServerAPIHealthService {
	getFull(): Promise<HealthResponse>;
	getLive(): Promise<HealthLiveResponse>;
	getReady(): Promise<HealthReadyResponse>;
}

export async function isServerOnline(): Promise<boolean> {
	try {
		await ServerAPIHealthService.getLive();
		return true;
	} catch {
		return false;
	}
}

function validateSuccessStatus(
	success: boolean,
	message: string,
	contextName: string
): void {
	if (!success) {
		throw new AppError(
			ErrorCode.SERVER_API_ERROR,
			`GitCord ${contextName} failed: ${message}`
		);
	}
}

function validateDatabaseCheck(checks?: {
	database?: { success: boolean; message: string };
}): void {
	if (checks?.database && !checks.database.success) {
		throw new AppError(
			ErrorCode.SERVER_API_ERROR,
			`GitCord database check failed: ${checks.database.message}`
		);
	}
}

export const ServerAPIHealthService: IServerAPIHealthService = {
	async getFull(): Promise<HealthResponse> {
		const data = await executeApiCall<HealthResponse>(
			() => apiClient.GET('/health'),
			'health'
		);
		validateSuccessStatus(
			data.success,
			`server is unhealthy: ${data.message}`,
			'server health check'
		);
		validateDatabaseCheck(data.checks);
		serverAPILogger.debug(
			'GitCord server full health check passed successfully.'
		);
		return data;
	},

	async getLive(): Promise<HealthLiveResponse> {
		const data = await executeApiCall<HealthLiveResponse>(
			() => apiClient.GET('/health/live'),
			'liveness'
		);
		validateSuccessStatus(
			data.success,
			`server process is unresponsive: ${data.message}`,
			'liveness check'
		);
		serverAPILogger.debug(
			'GitCord server liveness check passed successfully.'
		);
		return data;
	},

	async getReady(): Promise<HealthReadyResponse> {
		const data = await executeApiCall<HealthReadyResponse>(
			() => apiClient.GET('/health/ready'),
			'readiness'
		);
		validateSuccessStatus(
			data.success,
			`server readiness failed: ${data.message}`,
			'readiness check'
		);
		validateDatabaseCheck(data.checks);
		serverAPILogger.debug(
			'GitCord server readiness check passed successfully.'
		);
		return data;
	}
};
