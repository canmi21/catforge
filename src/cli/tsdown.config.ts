/* src/cli/tsdown.config.ts */

import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	format: 'esm',
	platform: 'node',
	target: 'node20',
	banner: { js: '#!/usr/bin/env node' },
	noExternal: ['@catforge/docs', '@catforge/schema', '@catforge/adapter-typescript', 'yaml'],
})