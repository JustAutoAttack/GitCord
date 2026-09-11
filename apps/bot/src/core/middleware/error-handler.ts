import type { ErrorHandler } from 'hono';

import { AppError, ErrorCode } from '../errors';
import { appLogger } from '../loggers';
import { Responses } from '../responses';

export const errorHandlerMiddleware = (): ErrorHandler => {
	return (error, ctx) => {
		if (error instanceof AppError) {
			const statusCode =
				error.code === ErrorCode.UNAUTHORIZED
					? 401
					: error.code === ErrorCode.FORBIDDEN
						? 403
						: error.code === ErrorCode.NOT_FOUND
							? 404
							: error.code === ErrorCode.CONFLICT
								? 409
								: error.code === ErrorCode.BAD_REQUEST
									? 400
									: 500;

			return ctx.json(
				Responses.error(error.code, error.message),
				statusCode as any
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
