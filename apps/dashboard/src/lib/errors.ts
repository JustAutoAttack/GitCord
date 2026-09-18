import { appLogger } from './app-logger';

export enum ErrorCode {
	SERVER_API_ERROR = 'SERVER_API_ERROR',
}

export class AppError extends Error {
	public readonly code: ErrorCode;

	constructor(code: ErrorCode, message?: string) {
		super(message ?? code);
		this.name = 'AppError';
		this.code = code;

		appLogger.error(`[${this.code}] ${this.message}`);
	}
}

export class AppWarning extends Error {
	public readonly code: ErrorCode;

	constructor(code: ErrorCode, message?: string) {
		super(message ?? code);
		this.name = 'AppWarning';
		this.code = code;

		appLogger.warn(`[${this.code}] ${this.message}`);
	}
}
