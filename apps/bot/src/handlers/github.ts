import { TextChannel, EmbedBuilder } from 'discord.js';

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
		author?: {
			username?: string;
			name?: string;
		};
	}>;
	head_commit?: {
		id?: string;
		message?: string;
		url?: string;
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

function createBaseEmbed(): EmbedBuilder {
	return new EmbedBuilder().setTimestamp();
}

function handlePushEvent(body: GitHubWebhookPayload, embed: EmbedBuilder) {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const branch = body.ref?.split('/').pop() ?? 'unknown-branch';
	const commits =
		body.commits ?? (body.head_commit ? [body.head_commit] : []);

	embed
		.setColor(COLORS.PUSH)
		.setTitle(`🔗 Branch update: ${branch}`)
		.setDescription(
			`${commits.length} new commit${commits.length === 1 ? '' : 's'} pushed to ${branch}`
		);

	const displayCommits = commits.slice(0, 3);
	let commitsText = '';

	for (const c of displayCommits) {
		const sha = c.id ? c.id.substring(0, 7) : '0000000';
		const message = c.message
			? c.message.split('\n')[0]
			: 'No commit message';
		const author = c.author?.username ?? c.author?.name ?? 'unknown';
		const link = c.url ? `[\`${sha}\`](${c.url})` : `\`${sha}\``;

		commitsText += `${link}  ${message.trim()}\n` + `> \`${author}\`\n\n`;
	}

	if (commitsText) {
		embed.addFields({
			name: '\u200b',
			value: commitsText.trim()
		});
	}

	embed.addFields(
		{
			name: 'Repository',
			value: repoUrl
				? `[${repoFullName}](${repoUrl})`
				: `\`${repoFullName}\``,
			inline: true
		},
		{
			name: 'Branch',
			value: `\`${branch}\``,
			inline: true
		}
	);
}

function handlePullRequestEvent(
	body: GitHubWebhookPayload,
	embed: EmbedBuilder
) {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const action = body.action ?? 'updated';
	const pr = body.pull_request;
	const isMerged = action === 'closed' && pr?.merged;

	let color = COLORS.PR_OPEN;
	if (isMerged) color = COLORS.PR_MERGED;
	else if (action === 'closed') color = COLORS.PR_CLOSE;

	const actionLabel = isMerged ? 'merged' : action;

	embed
		.setColor(color)
		.setTitle(`🔀 Pull Request ${actionLabel}: #${pr?.number}`)
		.setDescription(
			`**[${pr?.title ?? 'Untitled PR'}](${pr?.html_url})**${pr?.body ? `\n\n> ${pr.body.substring(0, 150)}...` : ''}`
		)
		.addFields(
			{ name: 'Repository', value: `\`${repoFullName}\``, inline: true },
			{
				name: 'Author',
				value: `\`${pr?.user?.login ?? 'unknown'}\``,
				inline: true
			},
			{ name: 'Status', value: `\`${actionLabel}\``, inline: true }
		);
}

function handleIssueEvent(body: GitHubWebhookPayload, embed: EmbedBuilder) {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const action = body.action ?? 'opened';
	const issue = body.issue;
	const color = action === 'closed' ? COLORS.PR_CLOSE : COLORS.ISSUE;

	embed
		.setColor(color)
		.setTitle(`📂 Issue ${action}: #${issue?.number}`)
		.setDescription(
			`**[${issue?.title ?? 'Untitled Issue'}](${issue?.html_url})**${issue?.body ? `\n\n> ${issue.body.substring(0, 150)}...` : ''}`
		)
		.addFields(
			{ name: 'Repository', value: `\`${repoFullName}\``, inline: true },
			{
				name: 'Author',
				value: `\`${issue?.user?.login ?? 'unknown'}\``,
				inline: true
			},
			{ name: 'Action', value: `\`${action}\``, inline: true }
		);
}

function handleReleaseEvent(body: GitHubWebhookPayload, embed: EmbedBuilder) {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const release = body.release;
	const name = release?.name ?? release?.tag_name ?? 'New Release';

	embed
		.setColor(COLORS.RELEASE)
		.setTitle(`🚀 Release Published: ${name} (${release?.tag_name ?? ''})`)
		.setDescription(
			release?.body
				? `${release.body.substring(0, 300)}...`
				: 'No release notes provided.'
		)
		.addFields({
			name: 'Repository',
			value: `\`${repoFullName}\``,
			inline: true
		});
}

function handleCreateEvent(
	body: GitHubWebhookPayload,
	embed: EmbedBuilder
): boolean {
	if (body.ref_type === 'branch') {
		const repoFullName = body.repository?.full_name ?? 'unknown/repo';
		const branch = body.ref ?? 'unknown-branch';
		const repoUrl = body.repository?.html_url;
		const branchUrl = `${repoUrl}/tree/${branch}`;
		const sender = body.sender?.login ?? 'unknown';

		embed
			.setColor(COLORS.BRANCH)
			.setTitle(`🌿 Branch created: ${branch}`)
			.setDescription(
				`New branch \`${branch}\` was created on \`${repoFullName}\``
			)
			.addFields(
				{
					name: 'Repository',
					value: repoUrl
						? `[${repoFullName}](${repoUrl})`
						: `\`${repoFullName}\``,
					inline: true
				},
				{ name: 'Creator', value: `\`${sender}\``, inline: true }
			);
		return true;
	}
	return false;
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
	const embed = createBaseEmbed();
	let hasEvent = false;

	switch (event) {
		case 'push':
			handlePushEvent(body, embed);
			hasEvent = true;
			break;
		case 'pull_request':
			handlePullRequestEvent(body, embed);
			hasEvent = true;
			break;
		case 'issues':
			handleIssueEvent(body, embed);
			hasEvent = true;
			break;
		case 'release':
			handleReleaseEvent(body, embed);
			hasEvent = true;
			break;
		case 'create':
			hasEvent = handleCreateEvent(body, embed);
			break;
		default:
			return `Event ${event} ignored`;
	}

	if (hasEvent) {
		await channel.send({ embeds: [embed] });
		return `Processed ${event} event successfully`;
	}

	return `Event ${event} yielded no message`;
}
