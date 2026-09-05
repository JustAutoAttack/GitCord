import type { ContentfulStatusCode } from 'hono/utils/http-status';

export enum ErrorCode {
	BAD_REQUEST = 'BAD_REQUEST',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	NOT_FOUND = 'NOT_FOUND',
	CONFLICT = 'CONFLICT',
	UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
	INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export const ERROR_STATUS_MAP: Record<ErrorCode, ContentfulStatusCode> = {
	[ErrorCode.BAD_REQUEST]: 400,
	[ErrorCode.UNAUTHORIZED]: 401,
	[ErrorCode.FORBIDDEN]: 403,
	[ErrorCode.NOT_FOUND]: 404,
	[ErrorCode.CONFLICT]: 409,
	[ErrorCode.UNPROCESSABLE_ENTITY]: 422,
	[ErrorCode.INTERNAL_ERROR]: 500
};

export type ErrorStatusCode = (typeof ERROR_STATUS_MAP)[ErrorCode];
