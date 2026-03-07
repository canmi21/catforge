import type { CatforgeConfig } from './src/docs/src/config.js'

const config: CatforgeConfig = {
	name: 'Catforge',
	packages: [
		{
			name: '@catforge/schema',
			adapter: 'typescript',
			source: 'tests/fixtures/schema.typedoc.json',
		},
	],
	docsDir: 'examples/docs',
	versionFrom: 'package.json',
}

export default config
