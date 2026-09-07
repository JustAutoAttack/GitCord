import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { createHeader, createFooter, createSeparator } from '@shared';
import type { GitHubIssue, GitHubRepository } from '../types';

export interface IssueEventContext {
	issue: GitHubIssue;
	action: string;
	repository?: GitHubRepository;
}

export function handleIssueEvent({
	issue,
	action,
	repository
}: IssueEventContext): ContainerBuilder {
	const numberDisplay = `#${issue.number}`;
	const titleDisplay = issue.html_url
		? `[${issue.title}](${issue.html_url})`
		: (issue.title ?? 'Untitled issue');

	return new ContainerBuilder({
		accent_color: CONFIG.colors.githubIssuesEvent,
		components: [
			createHeader(
				`Issue ${action}`,
				`${numberDisplay} · ${titleDisplay}`
			),
			...(repository?.full_name
				? [
						createSeparator(),
						createFooter(repository.full_name, repository.html_url)
					]
				: [])
		]
	});
}
