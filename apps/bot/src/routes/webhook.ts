import { Hono } from 'hono';
import { handleGitHubEvent } from '../handlers';

export const webhookRouter = new Hono();

webhookRouter.post('/github', async (c) => {
	const event = c.req.header('x-github-event');
	const body = await c.req.json().catch(() => null);

	if (!body) {
		return c.text('Invalid JSON payload', 400);
	}

	try {
		const resultMessage = await handleGitHubEvent(event, body);
		return c.text(resultMessage, 200);
	} catch (error: any) {
		console.error('[Webhook Error]', error);
		return c.text(error.message || 'Internal server error', 500);
	}
});
