import { createMiddleware } from 'hono/factory';

import { AppError, ErrorCode } from '../errors';
import { Responses } from '../responses';

export const responseMiddleware = createMiddleware(async (ctx, next) => {
	try {
		return await next();
	} catch (error: unknown) {
		if (error instanceof AppError) {
			return ctx.json(
				Responses.error(error.code, error.message),
				error.statusCode
			);
		}

		const message =
			error instanceof Error ? error.message : 'Internal Server Error';
		return ctx.json(
			Responses.error(ErrorCode.INTERNAL_ERROR, message),
			500
		);
	}
});
