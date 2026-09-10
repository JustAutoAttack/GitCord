import Database from 'better-sqlite3';

import { databaseLogger } from '@core';
import { sqlite } from './client';

export interface DbHealthResult {
	success: boolean;
	message: string;
	latencyMs?: number;
}

/**
 * Fast synchronous health probe for SQLite database
 * connectivity and latency.
 */
export function checkDatabaseHealth(
	database: Database.Database
): DbHealthResult {
	const start = performance.now();

	try {
		const row = database.prepare('SELECT 1 AS alive').get() as
			| { alive: number }
			| undefined;

		const latencyMs = Number((performance.now() - start).toFixed(2));

		if (row?.alive === 1) {
			return {
				success: true,
				message: 'Database connection is active and responsive',
				latencyMs
			};
		}

		databaseLogger.error(
			'CRITICAL: Database health check returned unexpected output (row.alive !== 1).'
		);
		return {
			success: false,
			message: 'Unexpected query output'
		};
	} catch (error) {
		const errorMsg =
			error instanceof Error ? error.message : 'Database check failed';
		databaseLogger.error(
			`CRITICAL: Database health check failed with exception: ${errorMsg}`
		);
		return {
			success: false,
			message: errorMsg
		};
	}
}

/**
 * Checks the production database connection.
 */
export function checkDbHealth(): DbHealthResult {
	return checkDatabaseHealth(sqlite);
}
