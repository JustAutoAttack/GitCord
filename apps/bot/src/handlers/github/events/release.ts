import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { GitHubWebhookPayload } from '../types';
import { COLORS } from '../constants';
import {
	createContainer,
	addSeparator,
	truncate,
	buildHeader,
	buildFooter
} from '../utils';

export function handleReleaseEvent(
	body: GitHubWebhookPayload
): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const release = body.release;

	const name = release?.name ?? release?.tag_name ?? 'New Release';
	const tag = release?.tag_name ? `\`${release.tag_name}\`` : '';
	const releaseNotes = release?.body
		? truncate(release.body, 500)
		: 'No release notes provided.';

	const container = createContainer(COLORS.RELEASE);

	buildHeader(
		container,
		`Release Published: ${repoFullName}`,
		tag ? `Tag: ${tag}` : 'New release version'
	);

	addSeparator(container);

	const releaseLink = release?.html_url
		? `**[${truncate(name, 150)}](${release.html_url})**`
		: `**${truncate(name, 150)}**`;

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`${releaseLink}\n\n**Release Notes**\n${releaseNotes}`
		)
	);

	buildFooter(container, repoFullName, repoUrl);
	return container;
}
