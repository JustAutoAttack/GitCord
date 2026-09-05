import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import Database from 'better-sqlite3';

const rootDir = process.cwd();

const dbPath = path.resolve(rootDir, 'database/temp_schema.db');

const migrationsDir = path.resolve(rootDir, 'database/migrations');

const tempPullDir = path.resolve(rootDir, 'database/temp_pull');

const targetSchemaDir = path.resolve(rootDir, 'src/database/generated');

// Clean previous temporary artifacts.

if (fs.existsSync(dbPath)) {
	fs.unlinkSync(dbPath);
}

if (fs.existsSync(tempPullDir)) {
	fs.rmSync(tempPullDir, {
		recursive: true,
		force: true
	});
}

try {
	const database = new Database(dbPath);

	const migrationFiles = fs
		.readdirSync(migrationsDir)
		.filter((file) => file.endsWith('.sql'))
		.sort();

	for (const file of migrationFiles) {
		const filePath = path.join(migrationsDir, file);

		console.log(`Executing migration: ${file}`);

		const sql = fs.readFileSync(filePath, 'utf8');

		database.exec(sql);
	}

	database.close();

	console.log('Running drizzle-kit pull...');

	execSync('npx drizzle-kit pull', {
		stdio: 'inherit'
	});

	fs.mkdirSync(targetSchemaDir, {
		recursive: true
	});

	const generatedSchemaFile = path.join(tempPullDir, 'schema.ts');

	if (fs.existsSync(generatedSchemaFile)) {
		fs.copyFileSync(
			generatedSchemaFile,
			path.join(targetSchemaDir, 'schema.ts')
		);
	}

	const generatedRelationsFile = path.join(tempPullDir, 'relations.ts');

	if (fs.existsSync(generatedRelationsFile)) {
		fs.copyFileSync(
			generatedRelationsFile,
			path.join(targetSchemaDir, 'relations.ts')
		);
	}

	console.log('Successfully updated generated schema!');
} finally {
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}

	if (fs.existsSync(tempPullDir)) {
		fs.rmSync(tempPullDir, {
			recursive: true,
			force: true
		});
	}
}
