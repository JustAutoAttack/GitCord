import { appLogger, lifecycleService } from './core';
import { createApp } from './app';
import { migrateDatabase } from './database';
import { gitHubSyncService, discordSyncService } from '@services';

async function main(): Promise<void> {
	try {
		appLogger.info('Initializing database migrations...');
		migrateDatabase();

		await gitHubSyncService.syncInstallations();
		await discordSyncService.sync();

		await lifecycleService.start(createApp);

		process.on('SIGTERM', () => {
			void lifecycleService.handleShutdown('SIGTERM');
		});

		process.on('SIGINT', () => {
			void lifecycleService.handleShutdown('SIGINT');
		});
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		appLogger.error(
			`CRITICAL: Failed to start GitCord server. Error: ${errorMsg}`
		);

		process.exit(1);
	}
}

void main();
