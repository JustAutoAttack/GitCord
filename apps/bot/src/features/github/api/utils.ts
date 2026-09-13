import { AppError, ErrorCode } from '@core';
import { logger } from '../logger';

export async function executeGitHubApiCall<T>(
	apiCall: () => Promise<{ data: T }>,
	contextName: string
): Promise<T> {
	try {
		const { data } = await apiCall();
		return data;
	} catch (error) {
		logger.error(`GitHub API call failed during ${contextName}:`, error);
		throw new AppError(
			ErrorCode.SERVER_API_ERROR,
			`GitHub API failed during ${contextName}`
		);
	}
}
