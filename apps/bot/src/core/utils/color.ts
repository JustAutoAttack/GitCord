export function parseHexColor(hex: string): number {
	const normalized = hex.trim().replace(/^#/, '');

	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
		throw new Error(`Invalid hex color: ${hex}`);
	}

	return Number.parseInt(normalized, 16);
}

export function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}
