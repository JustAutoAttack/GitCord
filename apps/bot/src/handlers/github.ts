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

const EMBED_COLORS: Record<string, number> = {
	PUSH: 0x2f81f7, // GitHub Blue
	PR_OPEN: 0x238636, // GitHub Green
	PR_CLOSE: 0xda3633, // GitHub Red
	PR_MERGED: 0x8957e5, // GitHub Purple
	ISSUE: 0xdb6d28, // GitHub Orange
	RELEASE: 0xf0883e, // Gold / Amber
	BRANCH: 0x7ee787, // Light Green
	DEFAULT: 0x30363d // Dark Border Grey
};

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
	const embed = new EmbedBuilder();
	let hasEvent = false;

	const senderName = body.sender?.login ?? 'GitHub Actions';
	const senderAvatar = body.sender?.avatar_url;
	embed.setFooter({
		text: `Triggered by @${senderName}`,
		iconURL: senderAvatar
	});
	embed.setTimestamp();

	switch (event) {
		case 'push': {
			const repo = body.repository?.name ?? 'unknown-repo';
			const repoUrl = body.repository?.html_url;
			const refParts = body.ref?.split('/') ?? [];
			const branch = refParts[refParts.length - 1] ?? 'unknown-branch';
			const commits =
				body.commits ?? (body.head_commit ? [body.head_commit] : []);

			embed
				.setColor(EMBED_COLORS.PUSH)
				.setTitle(
					`📦 [${repo}:${branch}] ${commits.length} new commit${commits.length === 1 ? '' : 's'}`
				)
				.setURL(repoUrl ?? null);

			const displayCommits = commits.slice(0, 5);

			for (const c of displayCommits) {
				const sha = c.id ? c.id.substring(0, 7) : '0000000';
				const message = c.message
					? c.message.split('\n')[0]
					: 'No commit message';
				const author =
					c.author?.username ?? c.author?.name ?? 'unknown';

				const commitTitle = c.url
					? `Commit — [\`${sha}\`](${c.url})`
					: `Commit — \`${sha}\``;

				embed.addFields({
					name: commitTitle,
					value: `> ${message.trim()}\n\n👤 **Contributor:** \`${author}\``
				});
			}

			hasEvent = true;
			break;
		}
		case 'pull_request': {
			const repo = body.repository?.name ?? 'unknown-repo';
			const action = body.action ?? 'updated';
			const prTitle = body.pull_request?.title ?? 'Untitled PR';
			const prUrl = body.pull_request?.html_url;
			const prNumber = body.pull_request?.number;
			const prUser = body.pull_request?.user?.login ?? 'unknown';
			const prBody = body.pull_request?.body;

			let color = EMBED_COLORS.PR_OPEN;
			if (action === 'closed' && body.pull_request?.merged) {
				color = EMBED_COLORS.PR_MERGED;
			} else if (action === 'closed') {
				color = EMBED_COLORS.PR_CLOSE;
			}

			const actionLabel =
				action === 'closed' && body.pull_request?.merged
					? 'merged'
					: action;

			embed
				.setColor(color)
				.setTitle(`🔀 Pull Request ${actionLabel}: #${prNumber}`)
				.setURL(prUrl ?? null)
				.setDescription(
					`**[${prTitle}](${prUrl})**${prBody ? `\n\n> ${prBody.substring(0, 150)}...` : ''}`
				)
				.addFields(
					{ name: 'Repository', value: `\`${repo}\``, inline: true },
					{ name: 'Author', value: `\`${prUser}\``, inline: true },
					{
						name: 'Status',
						value: `\`${actionLabel}\``,
						inline: true
					}
				);

			hasEvent = true;
			break;
		}
		case 'issues': {
			const repo = body.repository?.name ?? 'unknown-repo';
			const action = body.action ?? 'opened';
			const issueTitle = body.issue?.title ?? 'Untitled Issue';
			const issueUrl = body.issue?.html_url;
			const issueNumber = body.issue?.number;
			const issueUser = body.issue?.user?.login ?? 'unknown';
			const issueBody = body.issue?.body;

			let color = EMBED_COLORS.ISSUE;
			if (action === 'closed') color = EMBED_COLORS.PR_CLOSE;

			embed
				.setColor(color)
				.setTitle(`📂 Issue ${action}: #${issueNumber}`)
				.setURL(issueUrl ?? null)
				.setDescription(
					`**[${issueTitle}](${issueUrl})**${issueBody ? `\n\n> ${issueBody.substring(0, 150)}...` : ''}`
				)
				.addFields(
					{ name: 'Repository', value: `\`${repo}\``, inline: true },
					{ name: 'Author', value: `\`${issueUser}\``, inline: true },
					{ name: 'Action', value: `\`${action}\``, inline: true }
				);

			hasEvent = true;
			break;
		}
		case 'release': {
			const repo = body.repository?.name ?? 'unknown-repo';
			const action = body.action ?? 'published';
			const releaseName =
				body.release?.name ?? body.release?.tag_name ?? 'New Release';
			const releaseUrl = body.release?.html_url;
			const tagName = body.release?.tag_name ?? '';
			const releaseBody = body.release?.body;

			embed
				.setColor(EMBED_COLORS.RELEASE)
				.setTitle(`🚀 Release ${action}: ${releaseName} (${tagName})`)
				.setURL(releaseUrl ?? null)
				.setDescription(
					releaseBody
						? `${releaseBody.substring(0, 300)}...`
						: 'No release notes provided.'
				)
				.addFields({
					name: 'Repository',
					value: `\`${repo}\``,
					inline: true
				});

			hasEvent = true;
			break;
		}
		case 'create': {
			if (body.ref_type === 'branch') {
				const repo = body.repository?.name ?? 'unknown-repo';
				const branch = body.ref ?? 'unknown-branch';
				const repoUrl = body.repository?.html_url;
				const branchUrl = `${repoUrl}/tree/${branch}`;

				embed
					.setColor(EMBED_COLORS.BRANCH)
					.setTitle(`🌿 New Branch Created`)
					.setURL(branchUrl)
					.setDescription(
						`Branch \`${branch}\` was successfully created on \`${repo}\``
					);

				hasEvent = true;
				break;
			}
			break;
		}
		default:
			return `Event ${event} ignored`;
	}

	if (hasEvent) {
		await channel.send({ embeds: [embed] });
		return `Processed ${event} event successfully with embed`;
	}

	return `Event ${event} yielded no message`;
}
