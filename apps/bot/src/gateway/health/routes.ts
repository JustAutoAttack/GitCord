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
			description: 'Bot process response'
		}
	}
});

export const readyRoute = createRoute({
	method: 'get',
	path: '/ready',
	tags: ['Health'],
	summary: 'Readiness Probe',
	description: 'Validates bot integrations status.',
	responses: {
		200: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Integrations status report'
		},
		503: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Integrations failure report'
		}
	}
});

export const fullHealthRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Health'],
	summary: 'Full Diagnostic Health Check',
	description: 'Provides process uptime and integration status details.',
	responses: {
		200: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Full diagnostic report'
		},
		503: {
			content: {
				'application/json': { schema: HealthResponseSchema }
			},
			description: 'Degraded diagnostic report'
		}
	}
});
