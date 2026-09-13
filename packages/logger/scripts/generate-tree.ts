import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.resolve(ROOT_DIR, 'docs', 'tree.md');

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'coverage'];

function buildTree(currentDir: string, prefix = ''): string[] {
	let result: string[] = [];

	const entries = fs
		.readdirSync(currentDir, { withFileTypes: true })
		.filter((entry) => !EXCLUDED_DIRS.includes(entry.name))
		.sort((a, b) => {
			if (a.isDirectory() && !b.isDirectory()) return -1;
			if (!a.isDirectory() && b.isDirectory()) return 1;
			return a.name.localeCompare(b.name);
		});

	entries.forEach((entry, index) => {
		const isLast = index === entries.length - 1;
		const pointer = isLast ? '└── ' : '├── ';
		const fullPath = path.join(currentDir, entry.name);

		if (entry.isDirectory()) {
			result.push(`${prefix}${pointer}${entry.name}/`);
			const extension = isLast ? '    ' : '│   ';
			result = result.concat(buildTree(fullPath, prefix + extension));
		} else {
			result.push(`${prefix}${pointer}${entry.name}`);
		}
	});

	return result;
}

function generateTreeFile() {
	const docsDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(docsDir)) {
		fs.mkdirSync(docsDir, { recursive: true });
	}

	const treeLines = ['.', ...buildTree(ROOT_DIR)];
	const content = `# Project Directory Tree\n\n\`\`\`bash\n${treeLines.join('\n')}\n\`\`\`\n`;

	fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
	console.log(`Tree successfully generated at ${OUTPUT_FILE}`);
}

generateTreeFile();
