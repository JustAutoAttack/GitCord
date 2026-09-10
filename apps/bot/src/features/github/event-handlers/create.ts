import { ContainerBuilder } from 'discord.js';

import { CONFIG, createHeader, createFooter, createSeparator } from '@core';
import type { GitHubRepository } from '../types';

export interface CreateEventContext {
	ref: string;
	repository?: GitHubRepository;
}

export function handleCreateEvent({
	ref,
	repository
}: CreateEventContext): ContainerBuilder {
	const branchName = ref ?? 'unknown-branch';

	return new ContainerBuilder({
		accent_color: CONFIG.github.colors.create,
		components: [
			createHeader('Branch Created', branchName),
			...(repository?.full_name
				? [
						createSeparator(),
						createFooter(repository.full_name, repository.html_url)
					]
				: [])
		]
	});
}
