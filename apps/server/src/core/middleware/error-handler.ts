import type { ErrorHandler } from 'hono';

import { AppError, ErrorCode } from '../errors';
import { appLogger } from '../loggers';
import { Responses } from '../responses';

export const errorHandlerMiddleware = (): ErrorHandler => {
	return (error, ctx) => {
		if (error instanceof AppError) {
			return ctx.json(
				Responses.error(error.code, error.message),
				error.statusCode
			);
		}

		const message =
			error instanceof Error ? error.message : 'Internal Server Error';
		appLogger.error(
			`CRITICAL: Unhandled exception caught in global error boundary: ${message}`
		);
		return ctx.json(
			Responses.error(ErrorCode.INTERNAL_ERROR, message),
			500
		);
	};
};
