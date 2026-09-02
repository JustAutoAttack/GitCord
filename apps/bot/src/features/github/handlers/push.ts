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

	// Fixed indent for the author/time sub-line. Not derived from the sha
	// length — the sha renders in Discord's monospace code font while this
	// indent is plain text, so the widths never actually line up regardless
	// of how it's computed. A fixed indent just reads as intentional.
	const SUBLINE_INDENT = '\u00A0\u00A0\u00A0\u00A0';

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
			`${SUBLINE_INDENT}${authorDisplay}${relativeTime ? ` · ${relativeTime}` : ''}`
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
