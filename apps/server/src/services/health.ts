import { appLogger } from '@core';
import { checkDbHealth, DbHealthResult } from '@database';

export class HealthService {
	getLiveness() {
		appLogger.debug('Liveness probe check requested.');
		return {
			success: true,
			message: 'Server process is responsive',
			timestamp: new Date().toISOString()
		};
	}

	getReadiness(): {
		success: boolean;
		message: string;
		checks: { database: DbHealthResult };
		timestamp: string;
	} {
		appLogger.debug('Readiness probe check requested.');
		const dbCheck = checkDbHealth();

		if (!dbCheck.success) {
			appLogger.warn(
				`Readiness check failed: Database connection issue detected. Message: ${dbCheck.message}`
			);
		}

		return {
			success: dbCheck.success,
			message: dbCheck.success
				? 'Database connection is ready'
				: 'Database connection failed',
			checks: {
				database: dbCheck
			},
			timestamp: new Date().toISOString()
		};
	}

	getHealthOverview(): {
		success: boolean;
		message: string;
		uptimeSeconds: number;
		timestamp: string;
		checks: { database: DbHealthResult };
	} {
		appLogger.debug('Full health overview requested.');
		const dbCheck = checkDbHealth();

		if (!dbCheck.success) {
			appLogger.error(
				`System health degradation detected: Database failure during full health overview. Message: ${dbCheck.message}`
			);
		}

		return {
			success: dbCheck.success,
			message: dbCheck.success
				? 'System is fully operational'
				: 'System is degraded due to database failure',
			uptimeSeconds: Math.floor(process.uptime()),
			timestamp: new Date().toISOString(),
			checks: {
				database: dbCheck
			}
		};
	}
}

export const healthService = new HealthService();
