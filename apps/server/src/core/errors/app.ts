import { ErrorCode, ERROR_STATUS_MAP, type ErrorStatusCode } from './codes';

export class AppError extends Error {
	public readonly statusCode: ErrorStatusCode;
	public readonly code: ErrorCode;

	constructor(code: ErrorCode, message?: string) {
		super(message || code);
		this.name = 'AppError';
		this.code = code;
		this.statusCode = ERROR_STATUS_MAP[code];
	}
}
