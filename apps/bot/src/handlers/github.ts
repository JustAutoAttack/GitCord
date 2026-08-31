import {
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextChannel,
	TextDisplayBuilder
} from 'discord.js';

import { client } from '../core';
import { ENV } from '../config';

export interface GitHubCommit {
	id?: string;
	message?: string;
	url?: string;
	timestamp?: string;
	author?: {
		username?: string;
		name?: string;
		email?: string;
		login?: string;
	};
}

export interface GitHubWebhookPayload {
	repository?: {
		full_name?: string;
		name?: string;
		html_url?: string;
	};
	pusher?: {
		name?: string;
	};
	commits?: GitHubCommit[];
	head_commit?: GitHubCommit;
	ref?: string;
	action?: string;
	pull_request?: {
		title?: string;
		html_url?: string;
		number?: number;
		merged?: boolean;
		body?: string;
		user?: {
			login?: string;
		};
	};
	issue?: {
		title?: string;
		html_url?: string;
		number?: number;
		body?: string;
		user?: {
			login?: string;
		};
	};
	release?: {
		name?: string;
		tag_name?: string;
		html_url?: string;
		body?: string;
	};
	ref_type?: string;
	sender?: {
		login?: string;
		html_url?: string;
	};
	[key: string]: unknown;
}

const ALLOWED_REPOSITORY = 'JustAutoAttack/GitCord';

const COLORS = {
	PUSH: 0x2f81f7,
	PR_OPEN: 0x238636,
	PR_CLOSE: 0xda3633,
	PR_MERGED: 0x8957e5,
	ISSUE: 0xdb6d28,
	RELEASE: 0xf0883e,
	BRANCH: 0x7ee787
};

const MAX_COMMITS = 5;

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength - 3)}...`;
}

function getBranchName(ref?: string): string {
	if (!ref) return 'unknown-branch';
	return ref.replace(/^refs\/heads\//, '').replace(/^refs\/tags\//, '');
}

function createContainer(color: number): ContainerBuilder {
	return new ContainerBuilder().setAccentColor(color);
}

function addSeparator(container: ContainerBuilder): void {
	container.addSeparatorComponents(
		new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
	);
}

function createHeader(
	container: ContainerBuilder,
	title: string,
	subtitle: string
): void {
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`### ${title}\n${subtitle}`)
	);
}

function discordRelativeTimestamp(timestamp?: string): string {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return '';
	return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

function getCommitUsername(
	commit: GitHubCommit,
	body: GitHubWebhookPayload
): string {
	return (
		commit.author?.login ??
		commit.author?.username ??
		body.sender?.login ??
		body.pusher?.name ??
		'unknown'
	);
}

function createCommitSection(
	commit: GitHubCommit,
	body: GitHubWebhookPayload
): TextDisplayBuilder {
	const sha = commit.id?.substring(0, 7) ?? '0000000';
	const message = truncate(
		commit.message?.split('\n')[0].trim() || 'No commit message',
		140
	);
	const username = getCommitUsername(commit, body);
	const relativeTime = discordRelativeTimestamp(commit.timestamp);

	const shaDisplay = commit.url
		? `[\`${sha}\`](${commit.url})`
		: `\`${sha}\``;
	const metadata = relativeTime
		? `@${username} · ${relativeTime}`
		: `@${username}`;

	return new TextDisplayBuilder().setContent(
		[`${shaDisplay}  **${message}**`, metadata].join('\n')
	);
}

function buildCommitPanel(
	container: ContainerBuilder,
	commits: GitHubCommit[],
	body: GitHubWebhookPayload
): void {
	if (!commits.length) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'**Commits**\n> No commits included in this push.'
			)
		);
		return;
	}

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent('**Commits**')
	);

	const displayCommits = commits.slice(0, MAX_COMMITS);

	for (let index = 0; index < displayCommits.length; index++) {
		container.addTextDisplayComponents(
			createCommitSection(displayCommits[index], body)
		);

		if (index < displayCommits.length - 1) {
			addSeparator(container);
		}
	}

	const remaining = commits.length - displayCommits.length;
	if (remaining > 0) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`> +${remaining} more commit${remaining === 1 ? '' : 's'}`
			)
		);
	}
}

function addRepositoryFooter(
	container: ContainerBuilder,
	repoFullName: string,
	repoUrl?: string,
	extra?: string
): void {
	const repository = repoUrl
		? `[${repoFullName}](${repoUrl})`
		: `\`${repoFullName}\``;

	let content = `**Repository**\n${repository}`;
	if (extra) {
		content += `\n\n${extra}`;
	}

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(content)
	);
}

function addMessageTimestamp(container: ContainerBuilder): void {
	const unixTimestamp = Math.floor(Date.now() / 1000);
	addSeparator(container);
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`<t:${unixTimestamp}:f>`)
	);
}

function handlePushEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const branch = getBranchName(body.ref);
	const commits =
		body.commits ?? (body.head_commit ? [body.head_commit] : []);

	const container = createContainer(COLORS.PUSH);

	createHeader(
		container,
		`Push · ${branch}`,
		`${commits.length} new commit${
			commits.length === 1 ? '' : 's'
		} pushed to \`${branch}\``
	);

	addSeparator(container);
	buildCommitPanel(container, commits, body);
	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		['**Branch**', `\`${branch}\``].join('\n')
	);
	addMessageTimestamp(container);

	return container;
}

function handlePullRequestEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const action = body.action ?? 'updated';
	const pr = body.pull_request;

	const isMerged = action === 'closed' && pr?.merged === true;
	let color = COLORS.PR_OPEN;
	if (isMerged) color = COLORS.PR_MERGED;
	else if (action === 'closed') color = COLORS.PR_CLOSE;

	const actionLabel = isMerged ? 'merged' : action;
	const title = pr?.title ?? 'Untitled Pull Request';
	const description = pr?.body
		? `\n\n> ${truncate(pr.body.replace(/\n/g, ' '), 250)}`
		: '';

	const container = createContainer(color);

	createHeader(
		container,
		`Pull Request #${pr?.number ?? 'unknown'} · ${actionLabel}`,
		`**[${truncate(title, 150)}](${
			pr?.html_url ?? repoUrl ?? 'https://github.com'
		})**${description}`
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		[
			'**Author**',
			`\`@${pr?.user?.login ?? 'unknown'}\``,
			'',
			'**Status**',
			`\`${actionLabel}\``
		].join('\n')
	);
	addMessageTimestamp(container);

	return container;
}

function handleIssueEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const action = body.action ?? 'opened';
	const issue = body.issue;

	const color = action === 'closed' ? COLORS.PR_CLOSE : COLORS.ISSUE;
	const title = issue?.title ?? 'Untitled Issue';
	const description = issue?.body
		? `\n\n> ${truncate(issue.body.replace(/\n/g, ' '), 250)}`
		: '';

	const container = createContainer(color);

	createHeader(
		container,
		`Issue #${issue?.number ?? 'unknown'} · ${action}`,
		`**[${truncate(title, 150)}](${
			issue?.html_url ?? repoUrl ?? 'https://github.com'
		})**${description}`
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		[
			'**Author**',
			`\`@${issue?.user?.login ?? 'unknown'}\``,
			'',
			'**Action**',
			`\`${action}\``
		].join('\n')
	);
	addMessageTimestamp(container);

	return container;
}

function handleReleaseEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const release = body.release;

	const name = release?.name ?? release?.tag_name ?? 'New Release';
	const tag = release?.tag_name ? `\`${release.tag_name}\`` : '';
	const releaseNotes = release?.body
		? truncate(release.body, 500)
		: 'No release notes provided.';

	const container = createContainer(COLORS.RELEASE);

	createHeader(
		container,
		'Release Published',
		release?.html_url
			? `**[${truncate(name, 150)}](${release.html_url})**${
					tag ? ` · ${tag}` : ''
				}`
			: `**${truncate(name, 150)}**${tag ? ` · ${tag}` : ''}`
	);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			['**Release Notes**', releaseNotes].join('\n\n')
		)
	);

	addSeparator(container);
	addRepositoryFooter(container, repoFullName, repoUrl);
	addMessageTimestamp(container);

	return container;
}

function handleCreateEvent(
	body: GitHubWebhookPayload
): ContainerBuilder | null {
	if (body.ref_type !== 'branch') return null;

	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const branch = body.ref ?? 'unknown-branch';
	const sender = body.sender?.login ?? 'unknown';

	const branchUrl = repoUrl
		? `${repoUrl}/tree/${encodeURIComponent(branch)}`
		: undefined;
	const branchDisplay = branchUrl
		? `[${branch}](${branchUrl})`
		: `\`${branch}\``;

	const container = createContainer(COLORS.BRANCH);

	createHeader(
		container,
		'Branch Created',
		`New branch ${branchDisplay} was initialized.`
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		['**Creator**', `\`@${sender}\``].join('\n')
	);
	addMessageTimestamp(container);

	return container;
}

export async function handleGitHubEvent(
	event: string | undefined,
	body: GitHubWebhookPayload
): Promise<string> {
	const repoFullName = body.repository?.full_name;

	if (
		repoFullName &&
		repoFullName.toLowerCase() !== ALLOWED_REPOSITORY.toLowerCase()
	) {
		return `Ignored event from unauthorized repository: ${repoFullName}`;
	}

	const fetchedChannel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);
	if (!fetchedChannel || !fetchedChannel.isTextBased()) {
		throw new Error('Target Discord channel is invalid or not text-based.');
	}

	const channel = fetchedChannel as TextChannel;
	let container: ContainerBuilder | null = null;

	switch (event) {
		case 'push':
			container = handlePushEvent(body);
			break;
		case 'pull_request':
			container = handlePullRequestEvent(body);
			break;
		case 'issues':
			container = handleIssueEvent(body);
			break;
		case 'release':
			container = handleReleaseEvent(body);
			break;
		case 'create':
			container = handleCreateEvent(body);
			break;
		default:
			return `Event ${event} ignored`;
	}

	if (!container) return `Event ${event} yielded no message`;

	await channel.send({
		flags: MessageFlags.IsComponentsV2,
		components: [container]
	});

	return `Processed ${event} event successfully`;
}
