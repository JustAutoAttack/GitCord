import { z } from '@hono/zod-openapi';

export function response<T extends z.ZodTypeAny>(
	description: string,
	schema?: T
) {
	return schema
		? {
				description,
				content: {
					'application/json': {
						schema
					}
				}
			}
		: {
				description
			};
}
