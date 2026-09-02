import {
	exposeWebhookServer,
	startWebhookServer,
	stopWebhookServer
} from '@app';
import { logger, validateEnvironment } from '@core';
import { connectDiscord, disconnectDiscord } from '@discord';

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

async function shutdown(signal: string): Promise<void> {
	logger.info(`Received ${signal}. Shutting down GitCord...`);

	try {
		await stopWebhookServer();
		await disconnectDiscord(signal);

		logger.info('GitCord shutdown completed successfully.');
	} catch (error) {
		logger.error('Shutdown failed:', error);
	} finally {
		process.exit(0);
	}
}

process.once('SIGINT', () => {
	void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
	void shutdown('SIGTERM');
});

void main();
