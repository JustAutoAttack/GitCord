import type { paths } from './generated/schema';

// Health
export type HealthResponse =
	paths['/health']['get']['responses'][200]['content']['application/json'];

export type HealthLiveResponse =
	paths['/health/live']['get']['responses'][200]['content']['application/json'];

export type HealthReadyResponse =
	paths['/health/ready']['get']['responses'][200]['content']['application/json'];

// Auth

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

// Remote Config
export type RemoteConfigResponse =
	paths['/api/v1/remote-configs']['get']['responses'][200]['content']['application/json'];

export type RemoteConfigItemResponse =
	paths['/api/v1/remote-configs/{id}']['get']['responses'][200]['content']['application/json'];

export type CreateRemoteConfigRequest =
	paths['/api/v1/remote-configs']['post']['requestBody']['content']['application/json'];

export type UpdateRemoteConfigRequest =
	paths['/api/v1/remote-configs/{id}']['patch']['requestBody']['content']['application/json'];

export type DeleteRemoteConfigResponse =
	paths['/api/v1/remote-configs/{id}']['delete']['responses'][200]['content']['application/json'];
