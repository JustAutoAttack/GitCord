import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './database/temp_pull/schema.ts',
	out: './database/temp_pull',
	dbCredentials: {
		url: './database/temp_schema.db'
	}
});
