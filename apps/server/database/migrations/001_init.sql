PRAGMA foreign_keys = OFF;

-- ===== 
-- Users (Discord OAuth Identity)
-- =====
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    discord_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Enforces a unique record per Discord user identity
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- ===== 
-- User Sessions (Active Dashboard & API Authentication Tokens)
-- =====
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enforces a single active session per user record
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- ===== 
-- Bot Commands (Read-only reference registry for command permissions)
-- =====
CREATE TABLE IF NOT EXISTS bot_commands (
    id TEXT PRIMARY KEY NOT NULL,
    command_name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Enforces unique command names within the reference registry
CREATE UNIQUE INDEX IF NOT EXISTS idx_bot_commands_name ON bot_commands(command_name);

-- ===== 
-- Guild User Permissions (Normalized row-per-command access)
-- =====
CREATE TABLE IF NOT EXISTS guild_user_permissions (
    id TEXT PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    discord_user_id TEXT NOT NULL,
    command_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (command_id) REFERENCES bot_commands(id) ON DELETE CASCADE
);

-- Enforces a unique permission grant per user, per guild, per command
CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_user_perms_unique ON guild_user_permissions(guild_id, discord_user_id, command_id);

-- ===== 
-- Remote Configs
-- =====
CREATE TABLE IF NOT EXISTS remote_configs (
    id TEXT PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    repository_url TEXT NOT NULL,
    command_channel_id TEXT NOT NULL,
    notification_channel_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Enforces one subscription per repository per server
CREATE UNIQUE INDEX IF NOT EXISTS idx_remote_configs_guild_repo ON remote_configs(guild_id, repository_url);

-- Enforces one repository subscription per command channel
CREATE UNIQUE INDEX IF NOT EXISTS idx_remote_configs_command_channel_id ON remote_configs(command_channel_id);

-- ===== 
-- Guild Settings 
-- =====
CREATE TABLE IF NOT EXISTS guild_settings (
    id TEXT PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    system_channel_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Enforces one configuration row per guild
CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_settings_guild_id ON guild_settings(guild_id);

-- Enforces that a system channel cannot be bound to multiple guilds simultaneously
CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_settings_system_channel_id ON guild_settings(system_channel_id);

PRAGMA foreign_keys = ON;