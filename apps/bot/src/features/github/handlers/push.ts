import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';

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

	// All rendered inside a fenced code block, so sha/title/author share the
	// same monospace font — that's the only way column padding actually
	// lines up in Discord. Trade-off: sha is no longer a clickable link.
	const SHA_WIDTH = 7;
	const COLUMN_GAP = 2;
	const leftColWidth = SHA_WIDTH + COLUMN_GAP;

	const commitLines = displayedCommits.map((commit) => {
		const sha = (commit.id?.substring(0, 7) ?? 'unknown').padEnd(
			SHA_WIDTH,
			' '
		);

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

		const authorLine = `${authorDisplay}${relativeTime ? ` · ${relativeTime}` : ''}`;

		const blank = ' '.repeat(leftColWidth);

		return [`${sha}  ${truncatedMessage}`, `${blank}${authorLine}`].join(
			'\n'
		);
	});

	const commitContent =
		commitLines.length > 0
			? '```\n' + commitLines.join('\n\n') + '\n```'
			: '```\nNo commits included in payload.\n```';

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
