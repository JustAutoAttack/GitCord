import fs from 'node:fs/promises';
import path from 'node:path';
import openapiTS, { astToString } from 'openapi-typescript';

import { ENV } from '../src/env';

const SCHEMA_OUTPUT_PATH: string = 'src/schema.ts';

async function generate() {
	console.log(`Fetching OpenAPI spec from ${ENV.SERVER_DOCS_URL}...`);

	try {
		const ast = await openapiTS(new URL(ENV.SERVER_DOCS_URL));
		const contents = astToString(ast);
		const outputPath = path.resolve(process.cwd(), SCHEMA_OUTPUT_PATH);

		await fs.writeFile(outputPath, contents, 'utf8');
		console.log(`Successfully generated types at ${outputPath}`);
	} catch (error) {
		console.error('Failed to generate OpenAPI types:', error);
		process.exit(1);
	}
}

generate();
