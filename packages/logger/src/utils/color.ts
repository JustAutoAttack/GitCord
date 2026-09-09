const ANSI_RESET = '\x1b[0m';

export function hexToAnsi(hex: number): string {
	const red = (hex >> 16) & 0xff;
	const green = (hex >> 8) & 0xff;
	const blue = hex & 0xff;

	return `\x1b[38;2;${red};${green};${blue}m`;
}

export function colorize(text: string, hex: number): string {
	return `${hexToAnsi(hex)}${text}${ANSI_RESET}`;
}

export function parseHex(value: string): number | undefined {
	const normalized = value.trim().replace(/^#/, '');

	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
		return undefined;
	}

	return Number.parseInt(normalized, 16);
}
