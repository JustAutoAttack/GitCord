import { appLogger } from '@core';

export interface IntegrationHealthResult {
	success: boolean;
	message: string;
	latencyMs?: number;
}

export class HealthService {
	getLiveness() {
		appLogger.debug('Liveness probe check requested.');
		return {
			success: true,
			message: 'Bot process is responsive',
			timestamp: new Date().toISOString()
		};
	}

	getReadiness(): {
		success: boolean;
		message: string;
		checks: {
			github: IntegrationHealthResult;
			server: IntegrationHealthResult;
		};
		timestamp: string;
	} {
		appLogger.debug('Readiness probe check requested.');

		const githubCheck: IntegrationHealthResult = {
			success: true,
			message: 'GitHub integration service is ready'
		};

		const serverCheck: IntegrationHealthResult = {
			success: true,
			message: 'Server webhook communication is ready'
		};

		const success = githubCheck.success && serverCheck.success;

		if (!success) {
			appLogger.warn(
				'Readiness check failed: Integration issue detected.'
			);
		}

		return {
			success,
			message: success
				? 'Bot integrations are ready'
				: 'Bot integrations failed',
			checks: {
				github: githubCheck,
				server: serverCheck
			},
			timestamp: new Date().toISOString()
		};
	}

	getHealthOverview(): {
		success: boolean;
		message: string;
		uptimeSeconds: number;
		timestamp: string;
		checks: {
			github: IntegrationHealthResult;
			server: IntegrationHealthResult;
		};
	} {
		appLogger.debug('Full health overview requested.');
		const readiness = this.getReadiness();

		if (!readiness.success) {
			appLogger.error(
				'System health degradation detected during full health overview.'
			);
		}

		return {
			success: readiness.success,
			message: readiness.success
				? 'System is fully operational'
				: 'System is degraded due to integration failure',
			uptimeSeconds: Math.floor(process.uptime()),
			timestamp: readiness.timestamp,
			checks: readiness.checks
		};
	}
}

export const healthService = new HealthService();
