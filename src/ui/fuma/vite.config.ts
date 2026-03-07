import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { siteDataPlugin } from './src/plugins/vite-plugin-site-data.js'

export default defineConfig({
	plugins: [
		siteDataPlugin(),
		TanStackRouterVite({
			routesDirectory: './src/routes',
			generatedRouteTree: './src/route-tree.gen.ts',
		}),
		react(),
	],
	resolve: {
		alias: {
			'~': resolve(import.meta.dirname, 'src'),
		},
	},
	build: {
		outDir: 'dist',
	},
	ssr: {
		// Bundle all deps so SSR output is self-contained
		noExternal: true,
	},
})
