import type { ErrorCode } from './errors';
import type { ApiResponse } from './types';

export class Responses {
	public static success<T>(data: T, message?: string): ApiResponse<T> {
		return {
			success: true,
			data,
			...(message && { message })
		};
	}

	public static created<T>(
		data: T,
		message = 'Resource created successfully'
	): ApiResponse<T> {
		return {
			success: true,
			data,
			message
		};
	}

	public static error(code: ErrorCode, message?: string): ApiResponse {
		return {
			success: false,
			error: message || code
		};
	}
}
