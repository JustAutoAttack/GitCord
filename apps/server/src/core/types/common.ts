export type TableAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type TableName =
	| 'users'
	| 'user_sessions'
	| 'github_app_installations'
	| 'github_repositories'
	| 'bot_commands'
	| 'guild_user_permissions'
	| 'guild_repositories'
	| 'guild_settings';
