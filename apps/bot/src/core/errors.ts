import { logger } from './logger';

export enum ErrorCode {
	BAD_REQUEST = 'BAD_REQUEST',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	NOT_FOUND = 'NOT_FOUND',
	CONFLICT = 'CONFLICT',
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	SERVER_API_ERROR = 'SERVER_API_ERROR',
	DISCORD_API_ERROR = 'DISCORD_API_ERROR'
}

export class AppError extends Error {
	public readonly code: ErrorCode;

	constructor(code: ErrorCode, message?: string) {
		super(message ?? code);
		this.name = 'AppError';
		this.code = code;

		logger.error(`[${this.code}] ${this.message}`);
	}
}
