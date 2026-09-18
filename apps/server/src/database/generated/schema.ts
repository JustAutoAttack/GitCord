import { sqliteTable, AnySQLiteColumn, index, uniqueIndex, text, foreignKey, integer, numeric } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const oauthStates = sqliteTable("oauth_states", {
	id: text().primaryKey().notNull(),
	stateHash: text("state_hash").notNull(),
	client: text().notNull(),
	browserBindingHash: text("browser_binding_hash"),
	expiresAt: text("expires_at").notNull(),
	consumedAt: text("consumed_at"),
	createdAt: text("created_at").notNull(),
},
(table) => [
	index("idx_oauth_states_expires_at").on(table.expiresAt),
	uniqueIndex("idx_oauth_states_state_hash").on(table.stateHash),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	discordId: text("discord_id").notNull(),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_users_discord_id").on(table.discordId),
]);

export const userSessions = sqliteTable("user_sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	accessTokenEncrypted: text("access_token_encrypted").notNull(),
	refreshTokenHash: text("refresh_token_hash").notNull(),
	expiresAt: text("expires_at").notNull(),
	revokedAt: text("revoked_at"),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_user_sessions_user_id").on(table.userId),
]);

export const discordSessions = sqliteTable("discord_sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	accessTokenEncrypted: text("access_token_encrypted").notNull(),
	refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
	expiresAt: text("expires_at").notNull(),
	revokedAt: text("revoked_at"),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_discord_sessions_user_id").on(table.userId),
]);

export const githubAppInstallations = sqliteTable("github_app_installations", {
	id: text().primaryKey().notNull(),
	installationId: integer("installation_id").notNull(),
	accountLogin: text("account_login").notNull(),
	accountType: text("account_type").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_github_installations_ext_id").on(table.installationId),
]);

export const githubRepositories = sqliteTable("github_repositories", {
	id: text().primaryKey().notNull(),
	githubAppInstallationId: text("github_app_installation_id").notNull().references(() => githubAppInstallations.id, { onDelete: "cascade" } ),
	repositoryUrl: text("repository_url").notNull(),
	repositoryFullName: text("repository_full_name").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_github_repositories_repos_url").on(table.repositoryUrl),
]);

export const botCommands = sqliteTable("bot_commands", {
	id: text().primaryKey().notNull(),
	commandName: text("command_name").notNull(),
	description: text().notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_bot_commands_name").on(table.commandName),
]);

export const guildUserPermissions = sqliteTable("guild_user_permissions", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	discordUserId: text("discord_user_id").notNull(),
	commandId: text("command_id").notNull().references(() => botCommands.id, { onDelete: "cascade" } ),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_guild_user_perms_unique").on(table.guildId, table.discordUserId, table.commandId),
]);

export const guildRepositories = sqliteTable("guild_repositories", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	githubRepositoryId: text("github_repository_id").notNull().references(() => githubRepositories.id, { onDelete: "cascade" } ),
	commandChannelId: text("command_channel_id").notNull(),
	notificationChannelId: text("notification_channel_id").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_guild_repositories_command_channel_id").on(table.commandChannelId),
	uniqueIndex("idx_guild_repositories_guild_repo").on(table.guildId, table.githubRepositoryId),
]);

export const guildSettings = sqliteTable("guild_settings", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	systemChannelId: text("system_channel_id").notNull(),
	notifyOnConnection: numeric("notify_on_connection").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_guild_settings_system_channel_id").on(table.systemChannelId),
	uniqueIndex("idx_guild_settings_guild_id").on(table.guildId),
]);

