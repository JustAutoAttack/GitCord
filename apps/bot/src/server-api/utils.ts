import { AppError, ErrorCode, serverAPILogger } from '@core';

export function handleConnectionError(
	error: unknown,
	contextName?: string
): never {
	if (error instanceof AppError) {
		throw error;
	}
	const message = contextName
		? `Failed to connect to GitCord server during [${contextName}].`
		: 'Failed to connect to GitCord server.';

	serverAPILogger.warn(`${message} Target endpoint is offline.`);
	throw new AppError(ErrorCode.SERVER_API_ERROR, message);
}

export async function executeApiCall<T>(
	apiCall: () => Promise<any>,
	contextName: string
): Promise<T> {
	try {
		const { data, error } = await apiCall();

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

		return data as T;
	} catch (error: unknown) {
		handleConnectionError(error, contextName);
	}
}
