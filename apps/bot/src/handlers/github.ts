import { TextChannel } from 'discord.js';

import { client } from '../core';
import { ENV } from '../config';

export interface GitHubWebhookPayload {
	repository?: {
		full_name?: string;
		name?: string;
	};
	pusher?: {
		name?: string;
	};
	head_commit?: {
		message?: string;
		author?: {
			username?: string;
			name?: string;
		};
	};
	ref?: string;
	action?: string;
	pull_request?: {
		title?: string;
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

	// Hardcoded check: drop events that don't match your target repository
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
	let message = '';

	switch (event) {
		case 'push': {
			const repo = body.repository?.name ?? 'unknown-repo';

			// Extract branch name cleanly from 'refs/heads/branch-name'
			const refParts = body.ref?.split('/') ?? [];
			const branch = refParts[refParts.length - 1] ?? 'unknown-branch';

			// Get user info (fall back to pusher name or sender login if author isn't explicit)
			const author =
				body.head_commit?.author?.username ??
				body.head_commit?.author?.name ??
				body.pusher?.name ??
				body.sender?.login ??
				'someone';

			const commitMsg = body.head_commit?.message ?? 'No commit message';

			message = [
				`🔨 **New Push** to \`${repo}\``,
				`• **Branch:** \`${branch}\``,
				`• **User:** \`${author}\``,
				`• **Commit:** "${commitMsg.trim()}"`
			].join('\n');

			break;
		}
		case 'pull_request': {
			const repo = body.repository?.name ?? 'unknown-repo';
			const action = body.action ?? 'updated';
			const prTitle = body.pull_request?.title ?? 'Untitled PR';
			const prUser = body.pull_request?.user?.login ?? 'unknown';
			message = `🔀 **Pull Request ${action}** on \`${repo}\`: "${prTitle}" by \`${prUser}\``;
			break;
		}
		case 'create': {
			if (body.ref_type === 'branch') {
				const repo = body.repository?.name ?? 'unknown-repo';
				const branch = body.ref ?? 'unknown-branch';
				const sender = body.sender?.login ?? 'someone';
				message = `🌿 **New Branch** \`${branch}\` created on \`${repo}\` by \`${sender}\``;
				break;
			}
			break;
		}
		default:
			return `Event ${event} ignored`;
	}

	if (message) {
		await channel.send(message);
		return `Processed ${event} event successfully`;
	}

	return `Event ${event} yielded no message`;
}
