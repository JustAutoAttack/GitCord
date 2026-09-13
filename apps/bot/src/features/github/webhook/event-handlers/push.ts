import { ContainerBuilder } from 'discord.js';
import type { PushEvent } from '@octokit/webhooks-types';

import {
	CONFIG,
	createHeader,
	createFooter,
	createSeparator,
	createText
} from '@core';
import { discordRelativeTimestamp, getBranchName } from '../utils';

const DEFAULT_COMMIT_LIMIT = 5;
const MAX_COMMIT_LIMIT = 10;
const MAX_COMMIT_MESSAGE_LENGTH = 72;

export function handlePush(event: PushEvent): ContainerBuilder {
	const branchName = getBranchName(event.ref) || 'unknown';
	const commits = event.commits;
	const repository = event.repository;

	const commitLimit = Math.min(DEFAULT_COMMIT_LIMIT, MAX_COMMIT_LIMIT);

	const displayedCommits = commits.slice(0, commitLimit);

	const commitLines = displayedCommits.map((commit) => {
		const sha = commit.id?.substring(0, 7) ?? 'unknown';
		const message =
			commit.message?.split('\n')[0]?.trim() || 'No commit message';
		const maxLength = MAX_COMMIT_MESSAGE_LENGTH;

		const truncatedMessage =
			message.length > maxLength
				? `${message.substring(0, maxLength - 3)}...`
				: message;

		const username = getCommitUsername(commit, event);
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
		accent_color: CONFIG.github.colors.push,
		components: [
			createHeader(
				`Push: \`${branchName}\``,
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

export function getCommitUsername(
	commit: PushEvent['commits'][number],
	body: PushEvent
): string {
	return (
		commit.author?.username ??
		commit.committer?.username ??
		commit.author?.name ??
		commit.committer?.name ??
		body.sender?.login ??
		body.pusher?.name ??
		'unknown'
	);
}
