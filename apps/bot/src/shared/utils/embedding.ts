import { ComponentType, SeparatorSpacingSize } from 'discord.js';

export function createHeader(title: string, subtitle: string) {
	return {
		type: ComponentType.TextDisplay as const,
		content: `### ${title}\n${subtitle}`
	};
}

export function createText(content: string) {
	return {
		type: ComponentType.TextDisplay as const,
		content
	};
}

export function createSeparator() {
	return {
		type: ComponentType.Separator as const,
		spacing: SeparatorSpacingSize.Small
	};
}

export function createFooter(name: string, url?: string) {
	const display = url ? `[${name}](${url})` : `\`${name}\``;
	const unixTimestamp = Math.floor(Date.now() / 1000);

	return {
		type: ComponentType.TextDisplay as const,
		content: `${display}  ·  <t:${unixTimestamp}:f>`
	};
}
