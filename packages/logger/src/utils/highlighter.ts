import { colorize, parseHex } from './color';

export function parseHighlights(
	message: string,
	defaultColor: number,
	customHighlight?: number | string
): string {
	let colorToUse = defaultColor;

	if (typeof customHighlight === 'number') {
		colorToUse = customHighlight;
	} else if (typeof customHighlight === 'string') {
		const parsed = parseHex(customHighlight);
		if (parsed !== undefined) {
			colorToUse = parsed;
		}
	}

	// Matches text wrapped in backticks: `text`
	return message.replace(/`([^`]+)`/g, (_, match) => {
		return colorize(match, colorToUse);
	});
}