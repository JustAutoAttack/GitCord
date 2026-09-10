PRAGMA foreign_keys = OFF;

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