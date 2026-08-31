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
	return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

export function getCommitUsername(
	commit: GitHubCommit,
	body: GitHubWebhookPayload
): string {
	return (
		commit.author?.login ??
		commit.author?.username ??
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
