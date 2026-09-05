import fs from 'node:fs';
import path from 'node:path';

import { createApp } from '../src/app';
import { openAPIConfig } from '../src/app/openapi';

const outputPath = path.resolve(process.cwd(), 'docs/openapi.json');

const app = createApp();
const document = app.getOpenAPIDocument(openAPIConfig);

fs.mkdirSync(path.dirname(outputPath), {
	recursive: true
});

fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');

console.log(`OpenAPI spec successfully generated at: ${outputPath}`);
