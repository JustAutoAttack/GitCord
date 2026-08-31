import {
	ContainerBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder
} from 'discord.js';

import { GitHubCommit, GitHubWebhookPayload } from './types';

export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength - 3)}...`;
}

export function getBranchName(ref?: string): string {
	if (!ref) return 'unknown-branch';
	return ref.replace(/^refs\/heads\//, '').replace(/^refs\/tags\//, '');
}

export function createContainer(color: number): ContainerBuilder {
	return new ContainerBuilder().setAccentColor(color);
}

export function addSeparator(container: ContainerBuilder): void {
	container.addSeparatorComponents(
		new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
	);
}

export function discordRelativeTimestamp(timestamp?: string): string {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return '';

	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	if (seconds < 60) return `${Math.max(1, seconds)} sec. ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} min. ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hr. ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
	const weeks = Math.floor(days / 7);
	if (weeks < 4) return `${weeks} wk. ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months} mon. ago`;
	const years = Math.floor(days / 365);
	return `${years} yr. ago`;
}

export function getCommitUsername(
	commit: GitHubCommit,
	body: GitHubWebhookPayload
): string {
	return (
		commit.author?.login ??
		commit.author?.username ??
		commit.committer?.login ??
		commit.committer?.username ??
		commit.author?.name ??
		commit.committer?.name ??
		body.sender?.login ??
		body.pusher?.name ??
		'unknown'
	);
}

export function buildHeader(
	container: ContainerBuilder,
	title: string,
	subtitle: string
): void {
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`### ${title}\n${subtitle}`)
	);
}

export function buildFooter(
	container: ContainerBuilder,
	repoFullName: string,
	repoUrl?: string
): void {
	addSeparator(container);
	const repoDisplay = repoUrl
		? `[${repoFullName}](${repoUrl})`
		: `\`${repoFullName}\``;
	const unixTimestamp = Math.floor(Date.now() / 1000);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`${repoDisplay}  ·  <t:${unixTimestamp}:f>`
		)
	);
}
