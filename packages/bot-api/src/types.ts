import type { paths } from './generated/schema';

// Health
export type HealthResponse =
	paths['/api/health']['get']['responses'][200]['content']['application/json'];

export type HealthLiveResponse =
	paths['/api/health/live']['get']['responses'][200]['content']['application/json'];

export type HealthReadyResponse =
	paths['/api/health/ready']['get']['responses'][200]['content']['application/json'];

// Webhooks
export type LifecycleWebhookRequest = NonNullable<
	paths['/webhook/server/lifecycle']['post']['requestBody']
>['content']['application/json'];

export type LifecycleWebhookResponse =
	paths['/webhook/server/lifecycle']['post']['responses'][200]['content']['application/json'];

export type TableUpdateWebhookRequest = NonNullable<
	paths['/webhook/server/table-update']['post']['requestBody']
>['content']['application/json'];

export type TableUpdateWebhookResponse =
	paths['/webhook/server/table-update']['post']['responses'][200]['content']['application/json'];

export type GitHubWebhookRequest = NonNullable<
	paths['/webhook/server/github']['post']['requestBody']
>['content']['application/json'];

export type GitHubWebhookResponse =
	paths['/webhook/server/github']['post']['responses'][200]['content']['application/json'];
