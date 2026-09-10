import type {
	HealthResponse,
	HealthLiveResponse,
	HealthReadyResponse
} from '@gitcord/server-api';

import { AppError, ErrorCode, serverAPILogger } from '@core';
import { apiClient } from '../client';

/**
 * Service for checking the health status, liveness, and readiness
 * of the remote GitCord backend server.
 */
export interface IServerAPIHealthService {
	/**
	 * Verifies full application and database health status.
	 *
	 * @throws {AppError} If the server is unreachable, returns an error status, or if database checks fail.
	 */
	getFull(): Promise<HealthResponse>;

	/**
	 * Verifies basic process responsiveness.
	 *
	 * @throws {AppError} If the server is offline or the liveness check fails.
	 */
	getLive(): Promise<HealthLiveResponse>;

	/**
	 * Verifies database connectivity and readiness.
	 *
	 * @throws {AppError} If the server reports a readiness failure or database connectivity issues.
	 */
	getReady(): Promise<HealthReadyResponse>;
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
			`GitCord ${contextName} check failed.`
		);
	}

	if (!data) {
		throw new AppError(
			ErrorCode.SERVER_API_ERROR,
			`GitCord server returned an invalid ${contextName} response.`
		);
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
	database: { success: boolean; message: string };
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
		try {
			const { data, error } = await apiClient.GET('/health');
			validateResponseData(data, error, 'health');
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
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getLive(): Promise<HealthLiveResponse> {
		try {
			const { data, error } = await apiClient.GET('/health/live');
			validateResponseData(data, error, 'liveness');
			validateSuccessStatus(
				data.success,
				`server process is unresponsive: ${data.message}`,
				'liveness check'
			);

			serverAPILogger.debug(
				'GitCord server liveness check passed successfully.'
			);
			return data;
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	},

	async getReady(): Promise<HealthReadyResponse> {
		try {
			const { data, error } = await apiClient.GET('/health/ready');
			validateResponseData(data, error, 'readiness');
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
		} catch (error: unknown) {
			handleConnectionError(error);
		}
	}
};
