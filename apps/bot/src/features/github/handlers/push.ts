import {
	ContainerBuilder,
	TextDisplayBuilder,
	SectionBuilder
} from 'discord.js';

import { CONFIG } from '@core';
import {
	buildFooter,
	buildHeader,
	createContainer,
	addSeparator
} from '@shared';

import type { GitHubWebhookPayload } from '../types';

import {
	discordRelativeTimestamp,
	getBranchName,
	getCommitUsername
} from '../utils';

export function handlePushEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const branchName = getBranchName(body.ref) || 'unknown';
	const commits = body.commits ?? [];

	const commitLimit = Math.min(
		CONFIG.limits.defaultCommitLimit,
		CONFIG.limits.maxCommitLimit
	);

	const displayedCommits = commits.slice(0, commitLimit);

	const container = createContainer(CONFIG.colors.githubPushEvent);

	buildHeader(
		container,
		`Branch Update: \`${branchName}\``,
		`${commits.length} Commit${commits.length === 1 ? '' : 's'}`
	);

	addSeparator(container);

	const commitLines = displayedCommits.map((commit) => {
		const sha = commit.id?.substring(0, 7) ?? 'unknown';

		const message =
			commit.message?.split('\n')[0]?.trim() || 'No commit message';

		const maxLength = CONFIG.limits.maxCommitMessageLength;

		const truncatedMessage =
			message.length > maxLength
				? `${message.substring(0, maxLength - 3)}...`
				: message;

		const username = getCommitUsername(commit, body);

		const authorName = commit.author?.name ?? username ?? 'Unknown';

		const authorDisplay =
			username && authorName.toLowerCase() !== username.toLowerCase()
				? `${authorName} · @${username}`
				: authorName;

				
		const relativeTime = discordRelativeTimestamp(commit.timestamp);

		const shaDisplay = commit.url
			? `[\`${sha}\`](${commit.url})`
			: `\`${sha}\``;

		return [
			`${shaDisplay} ${truncatedMessage}`,
			`${authorDisplay}${relativeTime ? ` · ${relativeTime}` : ''}`
		].join('\n');
	});

	const commitContent =
		commitLines.length > 0
			? commitLines.join('\n\n')
			: 'No commits included in payload.';

	const commitsSection = new SectionBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(commitContent)
	);

	container.addSectionComponents(commitsSection);

	if (body.repository?.full_name) {
		buildFooter(
			container,
			body.repository.full_name,
			body.repository.html_url
		);
	}

	return container;
}
