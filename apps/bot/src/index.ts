import { appLogger } from '@core';
import {
	exposeWebhookServer,
	startWebhookServer,
	stopWebhookServer
} from '@app';
import { connectDiscord, disconnectDiscord } from './discord';
import { ServerAPIHealthService } from './server-api';

let shuttingDown = false;

async function main(): Promise<void> {
	try {
		appLogger.info('Starting GitCord...');

		appLogger.info('Checking GitCord server health...');
		await ServerAPIHealthService.getFull();
		appLogger.info('GitCord server is healthy.');

		await connectDiscord();

		startWebhookServer();

		await exposeWebhookServer();

		appLogger.info('GitCord startup completed successfully.');
	} catch (error) {
		appLogger.error('Startup failed:', error);

		process.exitCode = 1;
	}
}

async function shutdown(signal: string): Promise<void> {
	if (shuttingDown) {
		return;
	}

	shuttingDown = true;

	appLogger.info(`Received ${signal}. Shutting down GitCord...`);

	try {
		await stopWebhookServer();
		await disconnectDiscord(signal);

		appLogger.info('GitCord shutdown completed successfully.');
	} catch (error) {
		appLogger.error('Shutdown failed:', error);

		process.exitCode = 1;
	}
}

process.once('SIGINT', () => {
	void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
	void shutdown('SIGTERM');
});

void main();
