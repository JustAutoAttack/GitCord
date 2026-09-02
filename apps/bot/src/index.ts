import {
	exposeWebhookServer,
	logger,
	registerWebhookRouter,
	startWebhookServer,
	validateEnvironment
} from '@core';
import { connectDiscord } from '@discord';
import { webhookRouter } from '@features/github';

async function main(): Promise<void> {
	try {
		logger.info('Starting GitCord...');

		validateEnvironment();

		await connectDiscord();

		registerWebhookRouter(webhookRouter);

		startWebhookServer();

		await exposeWebhookServer();

		logger.info('GitCord startup completed successfully.');
	} catch (error) {
		logger.error('Startup failed:', error);

		process.exit(1);
	}
}

void main();
