# GitCord Dashboard: Product Specification & Overview

## 1. Executive Summary & Unique Selling Propositions (USPs)

The GitCord Dashboard is a centralized, web-based control plane designed to
complement the GitCord Discord bot. While chat-ops provide fast, inline
execution for day-to-day development tasks, the dashboard addresses the friction
points of bot administration—specifically around security, multi-repository
scaling, and notification delivery.

### Key USPs

- **Decoupled Security & Fine-Grained RBAC:** Eliminates reliance on brittle
  Discord server roles and overly broad permissions (like "Administrator" or
  "Manage Roles"). Server managers can explicitly provision administrative
  access to the bot independently of Discord role hierarchies.
- **Unified Multi-Repo Management:** Replaces repetitive chat commands with a
  visual interface to view, map, and audit repository bindings across guilds
  using standard REST workflows.
- **Out-of-Band Desktop Push Notifications:** Delivers critical GitHub
  repository and CI/CD updates directly to the developer's desktop via Web
  Push/WebSockets, removing the requirement to keep Discord open during active
  development sessions.

---

## 2. Core Affordances

The dashboard provides interface capabilities mapped to both administrative
control and developer productivity:

- **Repository Configuration & Mapping:**
    - Visual table interface for listing, creating, updating, and removing repository-to-channel bindings.
    - Explicit routing selectors for command channels and
      event notification channels.
- **Granular User Authorization Panel:**
    - Access control matrix allowing server managers to designate who can
      execute destructive or administrative commands (e.g.,
      `/git remote remove`) or modify server configurations.
- **Audit Logging & Activity Feed:**
    - Chronological tracking of configuration changes, remote removals, and
      pipeline alerts to maintain visibility over team actions.
- **Desktop Notification Hub:**
    - Opt-in subscription management for direct browser/desktop push alerts
      triggered by incoming GitHub webhook events.

---

## 3. General Quality of Life (QoL) Benefits

- **Reduced Chat Clutter:** Avoids flooding high-traffic Discord channels with
  long-form configuration lists, verbose remote setups, or troubleshooting
  syntax.
- **Faster Onboarding & Error Prevention:** Form-based inputs with validation
  prevent syntax errors common in manual CLI-style chat commands (such as
  malformed repository URIs or invalid channel IDs).
- **Persistent Developer Awareness:** Keeps engineers connected to build
  statuses and release events even when context-switching away from chat
  applications.

---

## 4. What GitCord Is Not (Design Boundaries)

To maintain architectural focus and avoid scope creep, the GitCord suite
(comprising the server backend, Discord bot, and web dashboard) strictly adheres
to the following boundaries:

- **Not a GitHub UI Wrapper:** The dashboard and bot do not attempt to replicate
  GitHub's website, issue trackers, code editors, or pull request review
  interfaces. They focus strictly on routing, notifications, and bot
  administration, leaving deep code inspection and artifact management to GitHub
  proper.
- **Not a Local Development Workstation:** GitCord intentionally avoids
  replicating local Git workstation mechanics. It does not manage local working
  trees, commit staging, local branching environments, or raw diff inspection.
- **Not a Generic Chat Bot:** The suite is purpose-built exclusively for Git
  semantics and team collaboration workflows. It is not designed to handle
  unrelated server utility tasks like moderation, music streaming, leveling
  systems, or general ticket management.
- **Not a Replacement for CI/CD Platforms:** GitCord surfaces health metrics and
  pipeline alerts as an observer and announcer, but it does not execute builds,
  host runners, or replace dedicated continuous integration engines like GitHub
  Actions.
