# GitCord Command Architecture & Specification

GitCord bridges Git CLI semantics with a multi-repository Discord bot platform.
Rather than attempting to replicate local workstation Git workflows (such as
local working trees or raw diff views), GitCord operates as an **observer,
announcer, and collaboration hub**. Commands are structured using familiar Git
verbs, but map directly to actionable, channel-bound team interactions.

---

## Feature Groups & Feature Matrix

### Group 1: Remote Repository Management

- Subscribing Discord channels to remote GitHub repositories.
- Mapping command execution and event notification channels per repository.
- Listing active channel subscriptions and routing configurations.
- Unsubscribing repositories and removing channel event handlers.

### Group 2: Channel Binding, Configuration & System Utility

- Inspecting active channel configuration parameters.
- Overriding or re-routing notification target channels.
- Interactive command documentation, usage syntax, and self-service onboarding.

### Group 3: Health & Pipeline Monitoring

- Monitoring build status for primary target branches (GitHub Actions CI/CD).
- Tracking repository-wide health metrics (open PR/issue counts).
- Surface-level monitoring of active GitHub platform incidents.

### Group 4: History & Object Inspection

- Querying recent commit history merged into primary branches.
- Deep-linking and unfurling specific PRs, Issues, or Commit SHAs into rich
  native components.

### Group 5: Collaboration State & Release Tracking

- Tracking active feature branches (open Pull Requests) and merge conflict
  state.
- Querying release tags, version histories, and changelogs.
- Summarizing repository velocity, contributor activity, and commit frequencies.

---

## Command Specifications & Design Rationales

### 1. `/git remote add <url> [notifications_channel]`

- **Feature Group**: Remote Repository Management
- **Parameters**:
    - `url` _(string, required)_: The target GitHub repository URL (e.g.,
      `https://github.com/org/repo`).
    - `notifications_channel` _(channel, optional)_: Dedicated text channel for
      routing webhook event alerts. Defaults to the invocation channel.
- **What It Does**: Subscribes the current Discord channel to a GitHub
  repository. Stores a configuration record mapping `guildId`, `repositoryUrl`,
  `commandChannelId` (invocation channel), and `notificationChannelId`.
- **Why Chosen Over Alternatives**: Replaces non-idiomatic verbs like
  `/git init` or `/git subscribe`. In the Git CLI, `git remote add <name> <url>`
  establishes a remote link. Since Discord channels serve as operational
  contexts, `/git remote add` accurately conveys registering a remote endpoint.

---

### 2. `/git remote list [verbose]`

- **Feature Group**: Remote Repository Management
- **Parameters**:
    - `verbose` _(boolean, optional)_: Alias for `-v`. Toggles expanded routing
      breakdown.
- **What It Does**: Fetches all repository configurations connected to the
  active server (`guildId`). Standard output lists target repository URLs;
  setting `verbose: true` displays explicit command and notification channel
  links (`<#channelId>`).
- **Why Chosen Over Alternatives**: Replaces top-level commands like `/git list`
  or `/git repos`. In the Git CLI, `git remote -v` prints remotes alongside
  fetch/push locations. Retaining `remote list` with a `verbose` toggle
  preserves CLI alignment while solving channel clutter and subscription
  visibility issues.

---

### 3. `/git remote remove <url>`

- **Feature Group**: Remote Repository Management
- **Parameters**:
    - `url` _(string, required)_: The repository URL to unsubscribe.
- **What It Does**: Queries database records for the matching repository URL
  within the current server context and removes the binding, preventing further
  event delivery.
- **Why Chosen Over Alternatives**: Replaces custom verbs like `/git unlink`,
  `/git remove`, or `/git delete`. Directly matches `git remote remove <name>`
  from standard Git CLI syntax.

---

### 4. `/git config`

- **Feature Group**: Channel Binding, Configuration & System Utility
- **Parameters**: None (or optional key/value overrides).
- **What It Does**: Inspects or modifies repository options, event filters, or
  channel overrides bound specifically to the current channel context.
- **Why Chosen Over Alternatives**: Replaces non-standard commands like
  `/git settings` or `/git setup`. Maps directly to `git config`, which in
  standard Git manages local operational parameters.

---

### 5. `/git help [command]`

- **Feature Group**: Channel Binding, Configuration & System Utility
- **Parameters**:
    - `command` _(string, optional)_: Specific subcommand to inspect (e.g.,
      `remote`, `status`).
- **What It Does**: Displays an ephemeral, interactive guide listing available
  subcommands, parameter syntax, example invocations, and active channel
  subscriptions.
- **Why Chosen Over Alternatives**: Replaces external documentation links or
  manual support questions. Mirrors standard CLI behavior (`git help` or
  `git <command> --help`), offering instant self-service onboarding inside chat.

---

### 6. `/git status`

- **Feature Group**: Health & Pipeline Monitoring
- **Parameters**: None.
- **What It Does**: Calls the GitHub REST API to return a high-density summary
  containing:
    1. GitHub Actions CI/CD pipeline status on the default branch
       (`main`/`master`).
    2. Open Pull Request and open Issue counts.
    3. GitHub platform incident status.
- **Why Chosen Over Alternatives**: Replaces commands like `/git ci`,
  `/git build`, or `/git health`. In local Git, `git status` reports working
  directory health. In a Discord workspace, "status" answers the developer
  question: _"Is the target branch passing builds and ready for integration?"_

---

### 7. `/git log`

- **Feature Group**: History & Object Inspection
- **Parameters**: None (or optional commit count).
- **What It Does**: Fetches the 3–5 most recent commits from the repository's
  default branch, displaying commit messages, author handles, short SHAs,
  relative timestamps, and direct GitHub web links.
- **Why Chosen Over Alternatives**: Replaces `/git commits` or `/git history`.
  Translates CLI log output directly into scannable Discord component cards for
  rapid deployment verification.

---

### 8. `/git show <target>`

- **Feature Group**: History & Object Inspection
- **Parameters**:
    - `target` _(string, required)_: PR number (`#12`), Issue number (`#45`), or
      Commit SHA (`a1b2c3d`).
- **What It Does**: Fetches and renders detailed metadata for a specific GitHub
  object, including title, state, author, reviewer approvals, CI workflow
  checks, and tags.
- **Why Chosen Over Alternatives**: Replaces fragmented commands like `/git pr`,
  `/git issue`, or `/git commit`. In standard Git, `git show <object>` inspects
  any explicit Git object regardless of type. A unified `show` command provides
  a clean interface and enhanced preview components over default chat link
  unfurls.

---

### 9. `/git branch`

- **Feature Group**: Collaboration State & Release Tracking
- **Parameters**: None.
- **What It Does**: Queries open Pull Requests targeting the default branch,
  displaying active feature branches, author handles, age, and merge conflict
  status (`mergeable_state`).
- **Why Chosen Over Alternatives**: Raw git branch listing (`git branch -a`)
  generates excessive chat noise from stale or unmerged local branches. In team
  workflows, active collaboration centers on open Pull Requests. Mapping
  `branch` to open PR/feature branch tracking preserves Git terminology while
  delivering actionable collaborative data.

---

### 10. `/git tags`

- **Feature Group**: Collaboration State & Release Tracking
- **Parameters**: None.
- **What It Does**: Lists recent repository tags, semantic version numbers, and
  associated release summaries fetched from GitHub.
- **Why Chosen Over Alternatives**: Replaces non-standard commands like
  `/git releases`. Aligns with `git tag -l` CLI usage to grant developers fast
  visibility into published versions.

---

### 11. `/git stats`

- **Feature Group**: Collaboration State & Release Tracking
- **Parameters**: None.
- **What It Does**: Aggregates repository activity metrics over the past 30
  days, including commit frequency, top contributors, and PR velocity.
- **Why Chosen Over Alternatives**: Mirrors analytical commands like
  `git shortlog -sn` or `git quick-stats`. Renders native repository metrics
  directly inside chat without requiring third-party analytics dashboards.
