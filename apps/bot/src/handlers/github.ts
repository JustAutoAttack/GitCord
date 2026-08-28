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
		};
	};
	ref_type?: string;
	sender?: {
		login?: string;
	};
	[key: string]: unknown;
}

const ALLOWED_REPOSITORY = 'JustAutoAttack/GitCord';

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
	const embed = new EmbedBuilder().setColor(0x2b2d31);
	let hasEvent = false;

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

			embed
				.setTitle(`New Push to ${repo}`)
				.setURL(repoUrl ?? null)
				.addFields(
					{ name: 'Branch', value: `\`${branch}\``, inline: true },
					{ name: 'Committer', value: `\`${author}\``, inline: true },
					{
						name: 'Commit',
						value:
							commitUrl && shortCommitId
								? `[\`${shortCommitId}\`](${commitUrl}) - ${commitMsg.trim()}`
								: commitMsg.trim()
					}
				)
				.setTimestamp();

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

			embed
				.setTitle(`Pull Request ${action}: #${prNumber} ${prTitle}`)
				.setURL(prUrl ?? null)
				.setDescription(`[View Pull Request](${prUrl})`)
				.addFields(
					{ name: 'Repository', value: `\`${repo}\``, inline: true },
					{ name: 'Author', value: `\`${prUser}\``, inline: true },
					{ name: 'Action', value: `\`${action}\``, inline: true }
				)
				.setTimestamp();

			hasEvent = true;
			break;
		}
		case 'create': {
			if (body.ref_type === 'branch') {
				const repo = body.repository?.name ?? 'unknown-repo';
				const branch = body.ref ?? 'unknown-branch';
				const sender = body.sender?.login ?? 'someone';
				const repoUrl = body.repository?.html_url;
				const branchUrl = `${repoUrl}/tree/${branch}`;

				embed
					.setTitle(`🌿 New Branch Created: ${branch}`)
					.setURL(branchUrl)
					.addFields(
						{
							name: 'Repository',
							value: `\`${repo}\``,
							inline: true
						},
						{
							name: 'Creator',
							value: `\`${sender}\``,
							inline: true
						}
					)
					.setTimestamp();

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
