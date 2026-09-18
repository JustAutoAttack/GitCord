import type { paths, webhooks } from './generated/schema';

// ===
// Paths
// ===

// Health
export type HealthResponse =
	paths['/api/health']['get']['responses'][200]['content']['application/json'];

export type HealthLiveResponse =
	paths['/api/health/live']['get']['responses'][200]['content']['application/json'];

export type HealthReadyResponse =
	paths['/api/health/ready']['get']['responses'][200]['content']['application/json'];

// Auth
export type AuthSignUpQuery =
	paths['/api/v1/auth/sign-up']['get']['parameters']['query'];

export type AuthSignUpResponse =
	paths['/api/v1/auth/sign-up']['get']['responses'][302];

export type AuthSignOutResponse =
	paths['/api/v1/auth/sign-out']['post']['responses'][200]['content']['application/json'];

export type AuthDiscordCallbackQuery =
	paths['/api/v1/auth/discord/callback']['get']['parameters']['query'];

export type AuthDiscordCallbackResponse =
	paths['/api/v1/auth/discord/callback']['get']['responses'][302];

// Integrations
export type DiscordInstallCallbackQuery =
	paths['/api/v1/integrations/discord/install-callback']['get']['parameters']['query'];

export type DiscordInstallCallbackResponse =
	paths['/api/v1/integrations/discord/install-callback']['get']['responses'][200]['content']['application/json'];

// Users
export type UserResponse =
	paths['/api/v1/users']['get']['responses'][200]['content']['application/json'];

export type UserItemResponse =
	paths['/api/v1/users/{id}']['get']['responses'][200]['content']['application/json'];

export type CreateUserRequest =
	paths['/api/v1/users']['post']['requestBody']['content']['application/json'];

export type UpdateUserRequest =
	paths['/api/v1/users/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteUserResponse =
	paths['/api/v1/users/{id}']['delete']['responses'][200]['content']['application/json'];

// User Sessions
export type UserSessionResponse =
	paths['/api/v1/user-sessions']['get']['responses'][200]['content']['application/json'];

export type UserSessionItemResponse =
	paths['/api/v1/user-sessions/{id}']['get']['responses'][200]['content']['application/json'];

export type CreateUserSessionRequest =
	paths['/api/v1/user-sessions']['post']['requestBody']['content']['application/json'];

export type UpdateUserSessionRequest =
	paths['/api/v1/user-sessions/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteUserSessionResponse =
	paths['/api/v1/user-sessions/{id}']['delete']['responses'][200]['content']['application/json'];

// Bot Commands
export type BotCommandResponse =
	paths['/api/v1/bot-commands']['get']['responses'][200]['content']['application/json'];

export type BotCommandItemResponse =
	paths['/api/v1/bot-commands/{id}']['get']['responses'][200]['content']['application/json'];

export type CreateBotCommandRequest =
	paths['/api/v1/bot-commands']['post']['requestBody']['content']['application/json'];

export type UpdateBotCommandRequest =
	paths['/api/v1/bot-commands/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteBotCommandResponse =
	paths['/api/v1/bot-commands/{id}']['delete']['responses'][200]['content']['application/json'];

// Guild User Permissions
export type GuildUserPermissionResponse =
	paths['/api/v1/guild-user-permissions']['get']['responses'][200]['content']['application/json'];

export type GuildUserPermissionItemResponse =
	paths['/api/v1/guild-user-permissions/{id}']['get']['responses'][200]['content']['application/json'];

export type CreateGuildUserPermissionRequest =
	paths['/api/v1/guild-user-permissions']['post']['requestBody']['content']['application/json'];

export type UpdateGuildUserPermissionRequest =
	paths['/api/v1/guild-user-permissions/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteGuildUserPermissionResponse =
	paths['/api/v1/guild-user-permissions/{id}']['delete']['responses'][200]['content']['application/json'];

// Guild Settings
export type GuildSettingResponse =
	paths['/api/v1/guild-settings']['get']['responses'][200]['content']['application/json'];

export type GuildSettingItemResponse =
	paths['/api/v1/guild-settings/{id}']['get']['responses'][200]['content']['application/json'];

export type CreateGuildSettingRequest =
	paths['/api/v1/guild-settings']['post']['requestBody']['content']['application/json'];

export type UpdateGuildSettingRequest =
	paths['/api/v1/guild-settings/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteGuildSettingResponse =
	paths['/api/v1/guild-settings/{id}']['delete']['responses'][200]['content']['application/json'];

// GitHub App Installations
export type GithubAppInstallationResponse =
	paths['/api/v1/github-app-installations']['get']['responses'][200]['content']['application/json'];

export type GithubAppInstallationItemResponse =
	paths['/api/v1/github-app-installations/{id}']['get']['responses'][200]['content']['application/json'];

export type GithubAppInstallationByInstallationIdResponse =
	paths['/api/v1/github-app-installations/installation/{installationId}']['get']['responses'][200]['content']['application/json'];

export type CreateGithubAppInstallationRequest =
	paths['/api/v1/github-app-installations']['post']['requestBody']['content']['application/json'];

export type UpdateGithubAppInstallationRequest =
	paths['/api/v1/github-app-installations/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteGithubAppInstallationResponse =
	paths['/api/v1/github-app-installations/{id}']['delete']['responses'][200]['content']['application/json'];

// GitHub Repositories
export type GithubRepositoryResponse =
	paths['/api/v1/github-repositories']['get']['responses'][200]['content']['application/json'];

export type GithubRepositoryItemResponse =
	paths['/api/v1/github-repositories/{id}']['get']['responses'][200]['content']['application/json'];

export type GithubRepositoryByLookupResponse =
	paths['/api/v1/github-repositories/lookup']['get']['responses'][200]['content']['application/json'];

export type CreateGithubRepositoryRequest =
	paths['/api/v1/github-repositories']['post']['requestBody']['content']['application/json'];

export type UpdateGithubRepositoryRequest =
	paths['/api/v1/github-repositories/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteGithubRepositoryResponse =
	paths['/api/v1/github-repositories/{id}']['delete']['responses'][200]['content']['application/json'];

// Guild Repositories
export type GuildRepositoryResponse =
	paths['/api/v1/guild-repositories']['get']['responses'][200]['content']['application/json'];

export type GuildRepositoryItemResponse =
	paths['/api/v1/guild-repositories/{id}']['get']['responses'][200]['content']['application/json'];

export type GuildRepositoryByLookupResponse =
	paths['/api/v1/guild-repositories/lookup']['get']['responses'][200]['content']['application/json'];

export type GuildRepositoryByCommandChannelResponse =
	paths['/api/v1/guild-repositories/command-channel/{commandChannelId}']['get']['responses'][200]['content']['application/json'];

export type CreateGuildRepositoryRequest =
	paths['/api/v1/guild-repositories']['post']['requestBody']['content']['application/json'];

export type UpdateGuildRepositoryRequest =
	paths['/api/v1/guild-repositories/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteGuildRepositoryResponse =
	paths['/api/v1/guild-repositories/{id}']['delete']['responses'][200]['content']['application/json'];

// GitHub Incoming Webhook
export type GitHubWebhookRequest = NonNullable<
	paths['/webhook/github']['post']['requestBody']
>['content']['application/json'];

export type GitHubWebhookResponse =
	paths['/webhook/github']['post']['responses'][200]['content']['application/json'];

// ===
// Webhooks
// ===

// Server Life Cycle
export type ServerLifecycleWebhookPayload =
	webhooks['serverLifecycle']['post']['requestBody']['content']['application/json'];

// Table Update
export type TableUpdateWebhookPayload =
	webhooks['tableUpdate']['post']['requestBody']['content']['application/json'];

export type TableAction = TableUpdateWebhookPayload['data']['action'];

// GitHub Event Outbound Webhook
export type GitHubEventWebhookPayload =
	webhooks['githubEvent']['post']['requestBody']['content']['application/json'];
