import { ContainerBuilder } from 'discord.js';

import { CONFIG, createHeader, createFooter, createSeparator } from '@core';
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
		accent_color: CONFIG.github.colors.issue,
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
