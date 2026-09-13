import { ContainerBuilder } from 'discord.js';
import type { CreateEvent } from '@octokit/webhooks-types';

import { CONFIG, createHeader, createFooter, createSeparator } from '@core';

export function handleCreate(event: CreateEvent): ContainerBuilder {
	const ref = event.ref;
	const repository = event.repository;

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
