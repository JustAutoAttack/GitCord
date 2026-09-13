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

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- ===== 
-- GitHub App Installations
-- =====
CREATE TABLE IF NOT EXISTS github_app_installations (
    id TEXT PRIMARY KEY NOT NULL,
    installation_id INTEGER NOT NULL,
    account_login TEXT NOT NULL,
    account_type TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_github_installations_ext_id ON github_app_installations(installation_id);

-- ===== 
-- GitHub Repositories
-- =====
CREATE TABLE IF NOT EXISTS github_repositories (
    id TEXT PRIMARY KEY NOT NULL,
    github_app_installation_id TEXT NOT NULL,
    repository_url TEXT NOT NULL,
    repository_full_name TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (github_app_installation_id) REFERENCES github_app_installations(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_github_repositories_repos_url ON github_repositories(repository_url);

-- ===== 
-- Bot Commands (Read-only reference registry for command permissions)
-- =====
CREATE TABLE IF NOT EXISTS bot_commands (
    id TEXT PRIMARY KEY NOT NULL,
    command_name TEXT NOT NULL,
    description TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_user_perms_unique ON guild_user_permissions(guild_id, discord_user_id, command_id);

-- ===== 
-- Guild Repositories
-- =====
CREATE TABLE IF NOT EXISTS guild_repositories (
    id TEXT PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    github_repository_id TEXT NOT NULL,
    command_channel_id TEXT NOT NULL,
    notification_channel_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (github_repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_repositories_guild_repo ON guild_repositories(guild_id, github_repository_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_repositories_command_channel_id ON guild_repositories(command_channel_id);

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_settings_guild_id ON guild_settings(guild_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_settings_system_channel_id ON guild_settings(system_channel_id);

PRAGMA foreign_keys = ON;