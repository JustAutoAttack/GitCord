PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS repo_configs (
    id TEXT PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    command_channel_id TEXT NOT NULL,
    notification_channel_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_repo_configs_command_channel_id ON repo_configs(command_channel_id);

PRAGMA foreign_keys = ON;