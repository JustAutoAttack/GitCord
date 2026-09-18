import { AppError, ErrorCode } from '../../errors';
import { logger } from '../logger';

export abstract class ServerService {
	protected async executeApiCall<T>(
		apiCall: () => Promise<any>,
		contextName: string
	): Promise<T> {
		try {
			const { data, error } = await apiCall();

			if (error) {
				throw new AppError(
					ErrorCode.SERVER_API_ERROR,
					`GitCord Server ${contextName} request failed.`
				);
			}

			if (!data) {
				logger.error(`Error executing API Call: No data`);
				throw new AppError(
					ErrorCode.SERVER_API_ERROR,
					`GitCord server returned an invalid ${contextName} response.`
				);
			}

			return data as T;
		} catch (error: unknown) {
			this.handleConnectionError(error, contextName);
		}
	}

	protected handleConnectionError(
		error: unknown,
		contextName?: string
	): never {
		if (error instanceof AppError) {
			throw error;
		}
		const message = contextName
			? `Failed to connect to GitCord server during [${contextName}].`
			: 'Failed to connect to GitCord server.';

		logger.warn(`${message} Target endpoint is offline.`);
		throw new AppError(ErrorCode.SERVER_API_ERROR, message);
	}

	protected validateSuccessStatus(
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

	protected validateDatabaseCheck(checks?: {
		database?: { success: boolean; message: string };
	}): void {
		if (checks?.database && !checks.database.success) {
			throw new AppError(
				ErrorCode.SERVER_API_ERROR,
				`GitCord database check failed: ${checks.database.message}`
			);
		}
	}
}
