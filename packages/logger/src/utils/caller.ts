import path from 'node:path';

export interface CallerInfo {
	filePath: string;
	line: number;
}

export function getCallerInfo(homeDir?: string): CallerInfo | undefined {
	const err = new Error();
	const stack = err.stack;
	if (!stack) {
		return undefined;
	}

	const lines = stack.split('\n');
	const stackLineRegex =
		/^\s*at\s+(?:.*?\s+\()?(?:file:\/\/)?(.*?):(\d+):\d+\)?$/;

	for (const line of lines) {
		const match = line.match(stackLineRegex);
		if (!match) {
			continue;
		}

		const rawFilePath = match[1];
		const rawLineNumber = match[2];

		if (!rawFilePath || !rawLineNumber) {
			continue;
		}

		const lineNumber = Number.parseInt(rawLineNumber, 10);
		const normalized = rawFilePath.replace(/\\/g, '/');
		const baseName = path.basename(normalized);
		const internalFiles = new Set([
			'logger.ts',
			'logger.js',
			'caller.ts',
			'caller.js',
			'index.ts',
			'index.js',
			'loader.ts',
			'loader.js',
			'defaults.ts',
			'defaults.js',
			'color.ts',
			'color.js',
			'timestamp.ts',
			'timestamp.js',
			'highlighter.ts',
			'highlighter.js',
			'levels.ts',
			'levels.js'
		]);

		if (
			internalFiles.has(baseName) ||
			normalized.includes('node_modules') ||
			normalized.includes('node:internal')
		) {
			continue;
		}

		const absolutePath = path.resolve(rawFilePath);

		let relativePath: string;
		if (homeDir && !path.relative(homeDir, absolutePath).startsWith('..')) {
			relativePath = path.relative(homeDir, absolutePath);
		} else {
			relativePath = path.relative(process.cwd(), absolutePath);
		}

		return {
			filePath: relativePath.split(path.sep).join('/'),
			line: lineNumber
		};
	}

	return undefined;
}
