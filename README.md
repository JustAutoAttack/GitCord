# GitCord

## Table of Contents

# V1 - Technical Specification

### System Architecture & Tech Stack

GitCord is engineered as a decoupled TypeScript application combining a
high-performance HTTP backend with a persistent Discord bot client.

- **Core Runtime**: Node.js utilizing Hono for rapid REST routing, webhook
  handling, and OAuth authentication callbacks.
- **Discord Integration**: Built on `discord.js` v10, managing slash command
  registration, event gateways, and rich component-based message rendering.
- **Data Persistence**: SQLite powered by Drizzle ORM to maintain lightweight,
  self-contained relational states across deployments.

### Authentication & Security Model

Security is enforced by eliminating static Personal Access Tokens (PATs) and
insecure role-granting logic in favor of strict, verifiable cryptographic and
API-backed controls.

- **Discord Identity Layer**: Dashboard access requires mandatory Discord OAuth
  authentication. Every platform transaction maps directly to a verified Discord
  User ID.
- **Live Ownership Validation**: Administrative authorization (such as
  repository addition and removal) bypasses local database caching by querying
  Discord's API directly at runtime, preventing privilege drift.
- **GitHub App Integration**: Replaces manual token pasting with a native GitHub
  App installation lifecycle. Repositories emit webhooks dynamically via
  short-lived installation tokens, allowing users to instantly revoke access
  directly through their GitHub repository settings.

### v1 Command Suite

| Command                           | Feature Group     | Functional Scope                                                                      |
| :-------------------------------- | :---------------- | :------------------------------------------------------------------------------------ |
| `/git remote add <url> [channel]` | Remote Management | Links a target repository URL to a designated Discord notification channel.           |
| `/git remote list [verbose]`      | Remote Management | Displays active repository routing configurations with optional channel ID expansion. |
| `/git remote remove <url>`        | Remote Management | Unbinds a repository and cleans up channel event subscriptions.                       |
| `/git config server`              | Configuration     | Initializes or modifies core server parameters and default system channels.           |
| `/git help [command]`             | System Utility    | Renders an ephemeral interactive guide detailing syntax and subcommand options.       |
| `/git status`                     | Health Monitoring | Fetches repository health metrics, open issue/PR counts, and CI/CD status.            |

### Relational Database Schema

- **`users`**: Binds Discord OAuth profiles and tokens to dashboard sessions.
- **`guild_settings`**: Stores server-level parameters, including system
  notification routing definitions.
- **`guild_user_permissions`**: Restricts sensitive command execution to
  authorized users within specific server contexts.
- **`remote_configs`**: Maps GitHub repository URLs to Discord guilds, command
  channels, and active webhook identifiers.

### Deployment & Onboarding Pipeline

Self-hosted instances utilize an automated interactive shell script (`setup.sh`)
to streamline configuration. The script verifies system prerequisites, injects
environment variables for database paths and API endpoints, executes Drizzle
schema migrations, and boots the application instances.
