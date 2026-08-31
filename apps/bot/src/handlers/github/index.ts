import { MessageFlags, TextChannel } from 'discord.js';

import { client } from '../../core';
import { ENV } from '../../config';
import { GitHubWebhookPayload } from './types';
import { ALLOWED_REPOSITORY } from './constants';
import {
	handlePushEvent,
	handlePullRequestEvent,
	handleIssueEvent,
	handleReleaseEvent,
	handleCreateEvent
} from './events';

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
	let container = null;

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
