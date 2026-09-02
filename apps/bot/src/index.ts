import {
	exposeWebhookServer,
	logger,
	startWebhookServer,
	validateEnvironment
} from './core';
import { connectDiscord } from './discord';

async function main(): Promise<void> {
	try {
		logger.info('Starting GitCord...');

		validateEnvironment();

		await connectDiscord();

		startWebhookServer();

		await exposeWebhookServer();

		logger.info('GitCord startup completed successfully.');
	} catch (error) {
		logger.error('Startup failed:', error);

		process.exit(1);
	}
}

void main();
