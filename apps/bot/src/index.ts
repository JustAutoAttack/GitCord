import { loginBot, startServer } from './core';

async function main() {
	try {
		// Start Discord Bot Gateway Connection
		await loginBot();

		// Start Hono Webhook Server
		startServer();
	} catch (error) {
		console.error('[Bootstrap Error]', error);
		process.exit(1);
	}
}

main();
