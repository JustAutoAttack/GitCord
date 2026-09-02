export function parseHex(hex: string): number {
	const normalized = hex.trim().replace(/^#/, '');

	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
		throw new Error(`Invalid hex color: ${hex}`);
	}

	return Number.parseInt(normalized, 16);
}
