import { appLogger, lifecycleService } from '@core';
import { createApp } from '@app';
import { connectDiscord, disconnectDiscord } from './discord';

async function main(): Promise<void> {
	try {
		await lifecycleService.start(createApp, connectDiscord);

		process.once('SIGINT', () => {
			void lifecycleService.handleShutdown('SIGINT', disconnectDiscord);
		});

		process.once('SIGTERM', () => {
			void lifecycleService.handleShutdown('SIGTERM', disconnectDiscord);
		});
	} catch (error) {
		appLogger.error('Startup failed:', error);
		process.exitCode = 1;
	}
}

void main();
