import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';
import path from 'node:path';

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
	plugins: [react(), tailwindcss()],

	// Path Aliases matching tsconfig.app.json
	resolve: {
		alias: {
			'@assets': path.resolve(__dirname, './src/assets'),
			'@components': path.resolve(__dirname, './src/components'),
			'@context': path.resolve(__dirname, './src/context'),
			'@features': path.resolve(__dirname, './src/features'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@router': path.resolve(__dirname, './src/router'),
			'@types': path.resolve(__dirname, './src/types')
		}
	},

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent Vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 3002,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421
				}
			: undefined,
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**']
		}
	}
}));
