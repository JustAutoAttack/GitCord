import { ErrorCode, ERROR_STATUS_MAP, type ErrorStatusCode } from './codes';
import { appLogger } from '../loggers';

export class AppError extends Error {
	public readonly statusCode: ErrorStatusCode;
	public readonly code: ErrorCode;

	constructor(code: ErrorCode, message?: string) {
		const finalMessage = message ?? code;
		super(finalMessage);
		this.name = 'AppError';
		this.code = code;
		this.statusCode = ERROR_STATUS_MAP[code] ?? 500;

		const logMessage = `[AppError] Code: ${this.code} | Status: ${this.statusCode} | Message: ${finalMessage}`;

		if (this.statusCode >= 500) {
			appLogger.error(logMessage);
		} else {
			appLogger.warn(logMessage);
		}
	}
}
