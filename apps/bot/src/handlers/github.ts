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
		user?: {
			login?: string;
			avatar_url?: string;
		};
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

// Professional Brand / Event Colors
const EMBED_COLORS = {
	PUSH: 0x2f81f7, // GitHub Blue
	PR_OPEN: 0x238636, // GitHub Green
	PR_CLOSE: 0xda3633, // GitHub Red/Pink
	PR_MERGED: 0x8957e5, // GitHub Purple
	BRANCH: 0x7ee787, // Light Green
	DEFAULT: 0x30363d // Dark Border Grey
} as const;

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

	// Common footer context for all GitHub embeds
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

			const author =
				body.head_commit?.author?.username ??
				body.head_commit?.author?.name ??
				body.pusher?.name ??
				body.sender?.login ??
				'someone';

			const commitMsg = body.head_commit?.message ?? 'No commit message';
			const commitUrl = body.head_commit?.url;
			const shortCommitId = body.head_commit?.id
				? body.head_commit.id.substring(0, 7)
				: '';

			// Format commit message neatly (take only the first line for the title/field header if multi-line)
			const firstLineMsg = commitMsg.split('\n')[0];

			embed
				.setColor(EMBED_COLORS.PUSH)
				.setTitle(`📦 New Push to ${repo}`)
				.setURL(repoUrl ?? null)
				.setDescription(
					`Branch: \`${branch}\` • Committer: \`${author}\``
				)
				.addFields({
					name: 'Latest Commit',
					value:
						commitUrl && shortCommitId
							? `[\`${shortCommitId}\`](${commitUrl}) — ${firstLineMsg.trim()}`
							: `— ${firstLineMsg.trim()}`
				});

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

			// Dynamic color based on PR lifecycle action
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
				.setDescription(`**[${prTitle}](${prUrl})**`)
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
						`Branch \`${branch}\` was successfully pushed to \`${repo}\``
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
