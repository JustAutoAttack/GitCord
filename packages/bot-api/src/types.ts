import type { paths } from './generated/schema';

// Health
export type HealthResponse =
	paths['/health']['get']['responses'][200]['content']['application/json'];

export type HealthLiveResponse =
	paths['/health/live']['get']['responses'][200]['content']['application/json'];

export type HealthReadyResponse =
	paths['/health/ready']['get']['responses'][200]['content']['application/json'];

// Webhooks
export type ServerWebhookRequest = NonNullable<
	paths['/webhooks/server']['post']['requestBody']
>['content']['application/json'];

export type ServerWebhookResponse =
	paths['/webhooks/server']['post']['responses'][200]['content']['application/json'];

export type GitHubWebhookRequest = NonNullable<
	paths['/webhooks/github']['post']['requestBody']
>['content']['application/json'];

export type GitHubWebhookResponse =
	paths['/webhooks/github']['post']['responses'][200]['content']['application/json'];
