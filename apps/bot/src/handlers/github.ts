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

export interface GitHubWebhookPayload {
	repository?: {
		full_name?: string;
		name?: string;
		html_url?: string;
	};

	pusher?: {
		name?: string;
	};

	commits?: Array<{
		id?: string;
		message?: string;
		url?: string;
		timestamp?: string;
		author?: {
			username?: string;
			name?: string;
		};
	}>;

	head_commit?: {
		id?: string;
		message?: string;
		url?: string;
		timestamp?: string;
		author?: {
			username?: string;
			name?: string;
		};
	};

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

/**
 * Truncate text without breaking the Discord message layout.
 */
function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}

	return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Convert a GitHub ref into a clean branch name.
 *
 * refs/heads/main -> main
 */
function getBranchName(ref?: string): string {
	if (!ref) {
		return 'unknown-branch';
	}

	return ref.replace(/^refs\/heads\//, '').replace(/^refs\/tags\//, '');
}

/**
 * Convert a GitHub timestamp into a Discord timestamp.
 *
 * Discord then renders:
 *   10 minutes ago
 *   2 hours ago
 * etc.
 *
 * Hovering the timestamp gives the exact localized date/time.
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
 * Create the main Components V2 container.
 */
function createContainer(color: number): ContainerBuilder {
	return new ContainerBuilder().setAccentColor(color);
}

/**
 * Add a clean separator between sections.
 */
function addSeparator(container: ContainerBuilder): void {
	container.addSeparatorComponents(
		new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
	);
}

/**
 * Create the main GitTrack-style header.
 */
function createHeader(
	container: ContainerBuilder,
	title: string,
	description: string,
	avatarUrl?: string
): void {
	const section = new SectionBuilder();

	section.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`## ${title}\n${description}`)
	);

	if (avatarUrl) {
		section.setThumbnailAccessory(
			new ThumbnailBuilder({
				media: {
					url: avatarUrl
				}
			})
		);
	}

	container.addSectionComponents(section);
}

/**
 * Build the commit list.
 *
 * Example:
 *
 * ### Commits
 *
 * `8f3d72c` **Refactor notification handlers**
 * devuser456 · 10m ago
 *
 * `2b9e35a` **Add multi-channel notifications**
 * johndoe123 · 25m ago
 */
function buildCommitPanel(commits: GitHubWebhookPayload['commits']): string {
	if (!commits?.length) {
		return '### Commits\n> No commits included in this push.';
	}

	const displayCommits = commits.slice(0, MAX_COMMITS);

	const commitRows = displayCommits.map((commit) => {
		const sha = commit.id?.substring(0, 7) ?? '0000000';

		const message = truncate(
			commit.message?.split('\n')[0].trim() || 'No commit message',
			120
		);

		const author =
			commit.author?.username ?? commit.author?.name ?? 'unknown';

		const relativeTime = discordRelativeTimestamp(commit.timestamp);

		const shaDisplay = commit.url
			? `[\`${sha}\`](${commit.url})`
			: `\`${sha}\``;

		const metadata = relativeTime ? `${author} · ${relativeTime}` : author;

		return [
			`${shaDisplay}`,
			`**${message}**`,
			`<sub>${metadata}</sub>`
		].join('\n');
	});

	let result = ['### Commits', '', commitRows.join('\n\n')].join('\n');

	const remaining = commits.length - displayCommits.length;

	if (remaining > 0) {
		result += `\n\n> +${remaining} more commit${
			remaining === 1 ? '' : 's'
		}`;
	}

	return result;
}

/**
 * Add repository metadata at the bottom.
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
 * PUSH
 *
 * GitTrack-style:
 *
 * 🌿 Branch update: main
 * 3 new commits pushed to main
 *
 * Commits
 * SHA  Message
 * author · time
 *
 * Repository
 * Branch
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
		} pushed to \`${branch}\``,
		body.sender?.avatar_url
	);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(buildCommitPanel(commits))
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		`**Branch**\n\`${branch}\``
	);

	return container;
}

/**
 * PULL REQUEST
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
		})**${description}`,
		pr?.user?.avatar_url
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		[
			`**Author**\n\`${pr?.user?.login ?? 'unknown'}\``,
			`**Status**\n\`${actionLabel}\``
		].join('\n\n')
	);

	return container;
}

/**
 * ISSUE
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
		})**${description}`,
		issue?.user?.avatar_url
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		[
			`**Author**\n\`${issue?.user?.login ?? 'unknown'}\``,
			`**Action**\n\`${action}\``
		].join('\n\n')
	);

	return container;
}

/**
 * RELEASE
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

	return container;
}

/**
 * CREATE
 *
 * Currently handles branch creation.
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
		`New branch ${branchDisplay} was created.`,
		body.sender?.avatar_url
	);

	addSeparator(container);

	addRepositoryFooter(
		container,
		repoFullName,
		repoUrl,
		`**Creator**\n\`${sender}\``
	);

	return container;
}

/**
 * Main GitHub event handler.
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
