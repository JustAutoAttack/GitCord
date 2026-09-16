import type {
	GithubAppInstallationItemResponse,
	GithubRepositoryItemResponse,
	GuildRepositoryItemResponse,
	BotCommandItemResponse,
	GuildSettingItemResponse,
	GuildUserPermissionItemResponse,
	UserItemResponse,
	UserSessionItemResponse
} from '@gitcord/server-api';
import { logger } from '../logger';

export type TableAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type TableNameMap = {
	users: UserItemResponse;
	user_sessions: UserSessionItemResponse;
	github_app_installations: GithubAppInstallationItemResponse;
	github_repositories: GithubRepositoryItemResponse;
	bot_commands: BotCommandItemResponse;
	guild_user_permissions: GuildUserPermissionItemResponse;
	guild_repositories: GuildRepositoryItemResponse;
	guild_settings: GuildSettingItemResponse;
};

export type TableName = keyof TableNameMap;

export type TableUpdatePayload = {
	[K in TableName]: {
		table: K;
		action: TableAction;
		record: TableNameMap[K];
	};
}[TableName];

type CacheStore = {
	[K in TableName]: Map<string, TableNameMap[K]>;
};

export class ServerCacheService {
	private cache: CacheStore = {
		users: new Map(),
		user_sessions: new Map(),
		github_app_installations: new Map(),
		github_repositories: new Map(),
		bot_commands: new Map(),
		guild_user_permissions: new Map(),
		guild_repositories: new Map(),
		guild_settings: new Map()
	};

	get<T extends TableName>(table: T, id: string): TableNameMap[T] | null {
		const targetMap = this.cache[table];
		return targetMap?.get(id) ?? null;
	}

	getAll<T extends TableName>(table: T): Map<string, TableNameMap[T]> {
		return this.cache[table];
	}
	
	set<T extends TableName>(
		table: T,
		id: string,
		record: TableNameMap[T]
	): void {
		const targetMap = this.cache[table];
		targetMap?.set(id, record);
		logger.debug(
			`[Server Cache] Cached record ID ${id} in table ${table}`
		);
	}

	handleTableUpdate<T extends TableName>(payload: {
		table: T;
		action: TableAction;
		record: TableNameMap[T];
	}): void {
		const { table, action, record } = payload;
		const targetMap = this.cache[table] as Map<string, TableNameMap[T]>;

		if (!targetMap) return;

		const recordId = record.id;

		if (action === 'DELETE') {
			targetMap.delete(recordId);
			logger.info(
				`[Server Cache] Evicted record ID ${recordId} from table ${table}`
			);
		} else if (action === 'CREATE' || action === 'UPDATE') {
			targetMap.set(recordId, record);
			logger.info(
				`[Server Cache] Updated record ID ${recordId} in table ${table}`
			);
		}
	}
}

export const serverCacheService = new ServerCacheService();
