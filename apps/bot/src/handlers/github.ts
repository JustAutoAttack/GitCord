import {
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextChannel,
	TextDisplayBuilder,
	ThumbnailBuilder
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
		avatar_url?: string;
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
			avatar_url?: string;
		};
	};

	issue?: {
		title?: string;
		html_url?: string;
		number?: number;
		body?: string;
		user?: {
			login?: string;
			avatar_url?: string;
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
		avatar_url?: string;
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
	if (text.length <= maxLength) {
		return text;
	}

	return `${text.substring(0, maxLength - 3)}...`;
}

function getBranchName(ref?: string): string {
	if (!ref) {
		return 'unknown-branch';
	}

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

/**
 * Header without an avatar.
 */
function createHeader(
	container: ContainerBuilder,
	title: string,
	description: string
): void {
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`## ${title}\n${description}`)
	);
}

/**
 * Discord relative timestamp.
 *
 * Discord updates this automatically.
 *
 * Example:
 * 39 seconds ago
 * 2 minutes ago
 * 3 hours ago
 */
function discordRelativeTimestamp(timestamp?: string): string {
	if (!timestamp) {
		return '';
	}

	const date = new Date(timestamp);

	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

/**
 * Return the GitHub username for a commit.
 */
function getCommitUsername(
	commit: GitHubCommit,
	body: GitHubWebhookPayload
): string {
	return (
		commit.author?.username ??
		body.sender?.login ??
		body.pusher?.name ??
		'unknown'
	);
}

/**
 * Return the best available avatar.
 */
function getCommitAvatar(
	commit: GitHubCommit,
	username: string,
	body: GitHubWebhookPayload
): string | undefined {
	if (commit.author?.avatar_url) {
		return commit.author.avatar_url;
	}

	if (username !== 'unknown') {
		return `https://github.com/${encodeURIComponent(username)}.png?size=64`;
	}

	return body.sender?.avatar_url;
}

/**
 * Create a commit row with a thumbnail accessory.
 */
function createCommitSection(
	commit: GitHubCommit,
	body: GitHubWebhookPayload
): SectionBuilder {
	const sha = commit.id?.substring(0, 7) ?? '0000000';

	const message = truncate(
		commit.message?.split('\n')[0].trim() || 'No commit message',
		140
	);

	const username = getCommitUsername(commit, body);

	const authorName = commit.author?.name ?? username;

	const relativeTime = discordRelativeTimestamp(commit.timestamp);

	const shaDisplay = commit.url
		? `[\`${sha}\`](${commit.url})`
		: `\`${sha}\``;

	const metadata = relativeTime
		? `${authorName} · @${username} · ${relativeTime}`
		: `${authorName} · @${username}`;

	const section = new SectionBuilder();

	section.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			[`${shaDisplay}  **${message}**`, metadata].join('\n')
		)
	);

	const avatarUrl = getCommitAvatar(commit, username, body);

	if (avatarUrl) {
		section.setThumbnailAccessory(
			new ThumbnailBuilder({
				media: {
					url: avatarUrl
				}
			})
		);
	}

	return section;
}

/**
 * Build the commit panel.
 */
function buildCommitPanel(
	container: ContainerBuilder,
	commits: GitHubCommit[],
	body: GitHubWebhookPayload
): void {
	if (!commits.length) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				['### Commits', '> No commits included in this push.'].join(
					'\n'
				)
			)
		);

		return;
	}

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent('### Commits')
	);

	const displayCommits = commits.slice(0, MAX_COMMITS);

	for (let index = 0; index < displayCommits.length; index++) {
		const commit = displayCommits[index];

		container.addSectionComponents(createCommitSection(commit, body));

		if (index < displayCommits.length - 1) {
			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);
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

/**
 * Add repository metadata.
 */
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

/**
 * Add the time the Discord message was sent.
 *
 * Discord renders this in the user's local time.
 */
function addMessageTimestamp(container: ContainerBuilder): void {
	const unixTimestamp = Math.floor(Date.now() / 1000);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`<t:${unixTimestamp}:f>`)
	);
}

/**
 * PUSH EVENT
 */
function handlePushEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';

	const repoUrl = body.repository?.html_url;

	const branch = getBranchName(body.ref);

	const commits =
		body.commits ?? (body.head_commit ? [body.head_commit] : []);

	const container = createContainer(COLORS.PUSH);

	createHeader(
		container,
		`🌿 Branch update: ${branch}`,
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

/**
 * PULL REQUEST EVENT
 */
function handlePullRequestEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';

	const repoUrl = body.repository?.html_url;

	const action = body.action ?? 'updated';

	const pr = body.pull_request;

	const isMerged = action === 'closed' && pr?.merged === true;

	let color = COLORS.PR_OPEN;

	if (isMerged) {
		color = COLORS.PR_MERGED;
	} else if (action === 'closed') {
		color = COLORS.PR_CLOSE;
	}

	const actionLabel = isMerged ? 'merged' : action;

	const title = pr?.title ?? 'Untitled Pull Request';

	const description = pr?.body
		? `\n\n> ${truncate(pr.body.replace(/\n/g, ' '), 250)}`
		: '';

	const container = createContainer(color);

	createHeader(
		container,
		`🔀 Pull Request ${actionLabel}: #${pr?.number ?? 'unknown'}`,
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
			`\`${pr?.user?.login ?? 'unknown'}\``,
			'',
			'**Status**',
			`\`${actionLabel}\``
		].join('\n')
	);

	addMessageTimestamp(container);

	return container;
}

/**
 * ISSUE EVENT
 */
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
		`📂 Issue ${action}: #${issue?.number ?? 'unknown'}`,
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
			`\`${issue?.user?.login ?? 'unknown'}\``,
			'',
			'**Action**',
			`\`${action}\``
		].join('\n')
	);

	addMessageTimestamp(container);

	return container;
}

/**
 * RELEASE EVENT
 */
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
		'🚀 Release published',
		release?.html_url
			? `**[${truncate(name, 150)}](${release.html_url})**${
					tag ? ` · ${tag}` : ''
				}`
			: `**${truncate(name, 150)}**${tag ? ` · ${tag}` : ''}`
	);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			['### Release Notes', releaseNotes].join('\n\n')
		)
	);

	addSeparator(container);

	addRepositoryFooter(container, repoFullName, repoUrl);

	addMessageTimestamp(container);

	return container;
}

/**
 * CREATE EVENT
 */
function handleCreateEvent(
	body: GitHubWebhookPayload
): ContainerBuilder | null {
	if (body.ref_type !== 'branch') {
		return null;
	}

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
		'🌿 Branch created',
		`New branch ${branchDisplay} was created.`
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		['**Creator**', `\`${sender}\``].join('\n')
	);

	addMessageTimestamp(container);

	return container;
}

/**
 * MAIN GITHUB EVENT HANDLER
 */
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

	if (!container) {
		return `Event ${event} yielded no message`;
	}

	await channel.send({
		flags: MessageFlags.IsComponentsV2,
		components: [container]
	});

	return `Processed ${event} event successfully`;
}
