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



https://tree.nathanfriend.com/?s=(%27opZs!(%27fancy!true~fullPath!false~trailingSlash!true~rootDot!true)~source!(%27source!%27appsH*botFcripU*deploy-commands%3Fapp2*4routO3coreJ5WXv34IWsLvL-api3discordJcommandsJ*gitJ8branchK*checkoutK*5K*diffK*fileK48initK*logK*pullK*statsK*statusK*tagsK*unlin%3D4*%25JhandlLsJ4*intLacZW%2BW%263featurOJgithubJ*evXt-handlLsJ8createK48issueK*pull-requOtK*pushK*releaseK%3E*48rOt-apiKtypOJ8apiK48webhoo%3D4*utilsKwebhooks3sharedJutilsJ*colorKembeddingW4*pathW%263B*unitJdiscordJgithub29ucZ2%2Cbot.toml2T%3ANC*dashboardH*sLvL2covLage2V2*dataJ%40_sLvL.db2*migraZsJ001_init.sql2docs2*opXapi7%232scripU*V-seed3V-rOet3%24-docs3%24-Q%3FappJ%263coreJLrorsJ*appKcodOW4middlewareJ4*rOponse%22KcryptoW4*jwtWXvWIsWrOponsOWQsWtypO3VJ%24dJ4*relaZsKQWreposJ*baseW4*%3BsWYW%2B34migrate3domain2*4%2F3gatewayJapiJ*v1J8%2FsJ8%5BK*48*routLK8routOK8QsK8typOK44YJ%5BW4*routLKroutOKQs3%3EY34%3Bs3B8Xd-to-Xd63unitJVJ*reposJ8%2Fs6K%2B6KY6Kmigrate6WgatewayJ*v1J8%3Bs6KY6%226Kcrypto6KY6Kjwt6K%3B6Wapp6WXv6WrOponsO6.U9ucZ2drizzle.5.UT%3A%252NC%23HGsH*IFrc2*5Jdefaults34loadL%3C34timOtamp3%263levels3I3typO.UtOU*5JloadL6%3C6WtimOtamp63levels63I6.U%2CI.Q7T7NC*sLvL-apiFcripU*%24-%2B%3F%24dJQ3%2B3Xv3B*unitJ%2B6WXv6.U9ucZ2G%3ANCscriptsH*buildLsH*installLsH*utils2colors.sh2I.sh2parsLs.sh2wrappLs.shH*build.shH*run.shH.gitattributOH.gitignoreHG-lock.jsonHG.jsonH%25%27)~vLsion!%271%27)*%20%202H83.U*4*%26W5config6.tOt7.jsonJ**9.Xv.%402.Xv.example2.Xv.prodB%26.UtOU*implemXtaZ2Cts567vitOt.5.tsHF2covLage2dist2%232sGpackageH%5CnIloggLJ28K38LerNts5.app7ts57OesQschemaT%2CI.toml2GUts2VdatabaseW3*XenYhealthZtion%22W%3E*async-storage%23node_modulO%24gXLate%25README.md%26index%2BcliXt%2Cgitcord-%2Fremote-5%3A-lock7G7%3Brepo-5%3C3utilsJcolor%3DkKconstantsW%3EsLvicOJ%3F.Usrc2*%40developmXt%5B*controllL%01%5B%40%3F%3E%3D%3C%3B%3A%2F%2C%2B%26%25%24%23%22ZYXWVUTQONLKJIHGFCB98765432*

