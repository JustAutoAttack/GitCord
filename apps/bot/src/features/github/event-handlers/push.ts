import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import {
	createHeader,
	createFooter,
	createSeparator,
	createText
} from '@shared';
import type {
	GitHubCommit,
	GitHubRepository,
	GitHubWebhookPayload
} from '../types';
import {
	discordRelativeTimestamp,
	getBranchName,
	getCommitUsername
} from '../utils';

export interface PushEventContext {
	ref: string;
	commits: GitHubCommit[];
	repository?: GitHubRepository;
	rawPayload: GitHubWebhookPayload;
}

export function handlePushEvent({
	ref,
	commits,
	repository,
	rawPayload
}: PushEventContext): ContainerBuilder {
	const branchName = getBranchName(ref) || 'unknown';

	const commitLimit = Math.min(
		CONFIG.limits.defaultCommitLimit,
		CONFIG.limits.maxCommitLimit
	);

	const displayedCommits = commits.slice(0, commitLimit);

	const commitLines = displayedCommits.map((commit) => {
		const sha = commit.id?.substring(0, 7) ?? 'unknown';
		const message =
			commit.message?.split('\n')[0]?.trim() || 'No commit message';
		const maxLength = CONFIG.limits.maxCommitMessageLength;

		const truncatedMessage =
			message.length > maxLength
				? `${message.substring(0, maxLength - 3)}...`
				: message;

		const username = getCommitUsername(commit, rawPayload);
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
			`-# ${authorDisplay}${relativeTime ? ` · ${relativeTime}` : ''}`
		].join('\n');
	});

	const commitContent =
		commitLines.length > 0
			? commitLines
					.join('\n\n')
					.split('\n')
					.map((line) => `> ${line}`)
					.join('\n')
			: '> No commits included in payload.';

	return new ContainerBuilder({
		accent_color: CONFIG.colors.githubPushEvent,
		components: [
			createHeader(
				`Branch Update: \`${branchName}\``,
				`${commits.length} Commit${commits.length === 1 ? '' : 's'}`
			),
			createSeparator(),
			createText(commitContent),
			...(repository?.full_name
				? [
						createSeparator(),
						createFooter(repository.full_name, repository.html_url)
					]
				: [])
		]
	});
}
