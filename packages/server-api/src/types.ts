import type { paths } from './generated/schema';

// Health
export type HealthResponse =
	paths['/health']['get']['responses'][200]['content']['application/json'];

export type HealthLiveResponse =
	paths['/health/live']['get']['responses'][200]['content']['application/json'];

export type HealthReadyResponse =
	paths['/health/ready']['get']['responses'][200]['content']['application/json'];

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
