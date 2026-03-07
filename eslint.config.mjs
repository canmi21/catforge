import tseslint from 'typescript-eslint'
import oxlint from 'eslint-plugin-oxlint'

export default tseslint.config(
	{
		ignores: ['**/dist/**', '**/route-tree.gen.ts', '**/vite.config.ts', '**/tsdown.config.ts'],
	},
	{
		files: ['src/**/*.{ts,tsx}'],
		extends: [
			...tseslint.configs.recommended,
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},

	// Disable rules already covered by oxlint
	oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
)
