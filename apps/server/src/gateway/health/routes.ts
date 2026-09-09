import { createRoute } from '@hono/zod-openapi';
import { HealthResponseSchema } from './schemas';

export const liveRoute = createRoute({
	method: 'get',
	path: '/live',
	tags: ['Health'],
	summary: 'Liveness Probe',
	description: 'Immediate process responsiveness check.',
	responses: {
		200: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Server process response'
		}
	}
});

export const readyRoute = createRoute({
	method: 'get',
	path: '/ready',
	tags: ['Health'],
	summary: 'Readiness Probe',
	description: 'Validates SQLite database connection.',
	responses: {
		200: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Database connection status report'
		}
	}
});

export const fullHealthRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Health'],
	summary: 'Full Diagnostic Health Check',
	description: 'Provides process uptime and database status details.',
	responses: {
		200: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Full diagnostic report'
		}
	}
});
