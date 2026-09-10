export const COMMAND_DOCS = {
	'remote add': {
		title: '/git remote add <url> [notifications_channel]',
		description:
			'Subscribes the current Discord channel to a remote GitHub repository.',
		syntax: '/git remote add url:https://github.com/org/repo notifications_channel:#alerts',
		details:
			'Stores a configuration record mapping your server guild, repository URL, invocation channel, and dedicated webhook event route.'
	},
	'remote list': {
		title: '/git remote list [verbose]',
		description:
			'Lists all repository configurations connected to the active server.',
		syntax: '/git remote list verbose:true',
		details:
			'Fetches active subscriptions. Use verbose mode to view explicit command and notification channel links.'
	},
	'remote remove': {
		title: '/git remote remove <url>',
		description:
			'Unsubscribes a GitHub repository from the current server context.',
		syntax: '/git remote remove url:https://github.com/org/repo',
		details:
			'Removes database records for the target repository, preventing further webhook event delivery.'
	},
	'config server': {
		title: '/git config server [system_channel]',
		description:
			'Configures guild-level settings and default system channels.',
		syntax: '/git config server system_channel:#general',
		details:
			'Requires administrator permissions. Sets up or updates server-wide notification routes.'
	},
	'config bot': {
		title: '/git config bot [nickname]',
		description: 'Configures bot server settings such as display nickname.',
		syntax: '/git config bot nickname:GitBot-Prod',
		details:
			'Requires administrator permissions. Updates the bot display name specifically for this server.'
	},
	'config events': {
		title: '/git config events [pull_requests] [issues] [ci_checks]',
		description:
			'Toggles or filters specific GitHub event streams for the server.',
		syntax: '/git config events pull_requests:true ci_checks:false',
		details:
			'Requires administrator permissions. Controls which notification types are delivered.'
	},
	status: {
		title: '/git status',
		description:
			'Returns a high-density summary of repository and pipeline health.',
		syntax: '/git status',
		details:
			'Queries GitHub to report Actions CI/CD status on the default branch, open PR/issue counts, and platform incidents.'
	},
	log: {
		title: '/git log',
		description: 'Fetches recent commits merged into the default branch.',
		syntax: '/git log',
		details:
			'Displays commit messages, author handles, short SHAs, relative timestamps, and direct web links.'
	},
	show: {
		title: '/git show <target>',
		description:
			'Fetches and renders detailed metadata for a specific GitHub object.',
		syntax: '/git show target:#12',
		details:
			'Inspects Pull Requests (#ID), Issues (#ID), or Commit SHAs with rich native components.'
	},
	branch: {
		title: '/git branch',
		description: 'Queries open Pull Requests targeting the default branch.',
		syntax: '/git branch',
		details:
			'Displays active feature branches, author handles, age, and merge conflict status.'
	},
	tags: {
		title: '/git tags',
		description:
			'Lists recent repository tags and semantic release version histories.',
		syntax: '/git tags',
		details:
			'Grants fast visibility into published releases and associated summaries.'
	},
	stats: {
		title: '/git stats',
		description:
			'Aggregates repository activity metrics over the past 30 days.',
		syntax: '/git stats',
		details:
			'Displays commit frequency, top contributors, and pull request velocity.'
	}
} as const;

