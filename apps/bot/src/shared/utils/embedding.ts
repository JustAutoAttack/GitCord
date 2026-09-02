import {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize
} from 'discord.js';

export function createContainer(color: number): ContainerBuilder {
	return new ContainerBuilder().setAccentColor(color);
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

export function addSeparator(container: ContainerBuilder): void {
	container.addSeparatorComponents(
		new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
	);
}

export function buildFooter(
	container: ContainerBuilder,
	name: string,
	url?: string
): void {
	addSeparator(container);

	const display = url ? `[${name}](${url})` : `\`${name}\``;

	const unixTimestamp = Math.floor(Date.now() / 1000);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`${display}  ·  <t:${unixTimestamp}:f>`
		)
	);
}
