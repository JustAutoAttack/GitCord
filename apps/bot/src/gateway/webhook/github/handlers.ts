import { RouteHandler } from '@hono/zod-openapi';
import { webhookService } from '@services';
import { eventRoute } from './routes';

export const eventHandler: RouteHandler<typeof eventRoute> = async (
	ctx
) => {
	const success = await webhookService.processGitHubWebhook(ctx);

	if (!success) {
		return ctx.json(
			{ success: false, error: 'Failed to process GitHub webhook' },
			400
		);
	}

	return ctx.json({ success: true }, 200);
};
