import path from 'node:path';

export function getRootDir(): string {
	return path.resolve(__dirname, '../../..');
}

export function resolveRootPath(...segments: string[]): string {
	return path.resolve(getRootDir(), ...segments);
}
