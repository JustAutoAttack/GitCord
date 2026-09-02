import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { buildFooter, buildHeader, createContainer } from '@shared';
import type { GitHubWebhookPayload } from '../types';
import {
	discordRelativeTimestamp,
	getBranchName,
	getCommitUsername
} from '../utils';

export function handlePushEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const branchName = getBranchName(body.ref);
	const commits = body.commits ?? [];

	const commitLimit = Math.min(
		CONFIG.limits.defaultCommitLimit,
		CONFIG.limits.maxCommitLimit
	);

	const displayedCommits = commits.slice(0, commitLimit);

	const commitLines = displayedCommits.map((commit) => {
		const sha = commit.id?.substring(0, 7) ?? 'unknown';

		const message =
			commit.message?.split('\n')[0].trim() ?? 'No commit message';

		const maxLength = CONFIG.limits.maxCommitMessageLength;

		const truncatedMessage =
			message.length > maxLength
				? `${message.substring(0, maxLength - 3)}...`
				: message;

		const username =
			getCommitUsername(commit, body) || body.pusher?.name || 'unknown';

		const authorName = commit.author?.name || username || 'Unknown author';

		const relativeTime = discordRelativeTimestamp(commit.timestamp);

		const shaDisplay = commit.url
			? `[\`${sha}\`](${commit.url})`
			: `\`${sha}\``;

		return [
			`${shaDisplay} ${truncatedMessage}`,
			`${authorName} · @${username}${
				relativeTime ? ` · ${relativeTime}` : ''
			}`
		].join('\n');
	});

	const subtitle = `${commits.length} new commit${
		commits.length === 1 ? '' : 's'
	} pushed to ${branchName}`;

	const container = createContainer(CONFIG.colors.githubPushEvent);

	buildHeader(container, `Branch update: ${branchName}`, subtitle);

	const commitContent = [
		'### Commits',
		commitLines.length > 0
			? commitLines.join('\n\n')
			: 'No commits included in payload.'
	].join('\n');

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(commitContent)
	);

	if (body.repository?.full_name) {
		buildFooter(
			container,
			body.repository.full_name,
			body.repository.html_url
		);
	}

	return container;
}
