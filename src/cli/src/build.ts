/* src/cli/src/build.ts */

import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
import { buildSite } from '@catforge/docs'
import type { AdapterLoader, CatforgeConfig } from '@catforge/docs'
import { convertTypedocFile } from '@catforge/adapter-typescript'

const staticLoadAdapter: AdapterLoader = async (entry) => {
	if (entry.adapter === 'typescript') {
		return convertTypedocFile(entry.source)
	}
	throw new Error(`Unsupported adapter "${entry.adapter}" in bundled CLI`)
}

export async function loadConfig(rootDir: string): Promise<CatforgeConfig> {
	const configPath = resolve(rootDir, 'catforge.config.ts')
	const jiti = createJiti(import.meta.url, { interopDefault: true })
	const mod = (await jiti.import(configPath)) as CatforgeConfig | { default: CatforgeConfig }
	const config = 'default' in mod ? mod.default : mod

	if (!config.name || !Array.isArray(config.packages)) {
		throw new Error(`Invalid config: "name" (string) and "packages" (array) are required`)
	}

	return config
}

export async function runBuild(rootDir: string): Promise<void> {
	const config = await loadConfig(rootDir)

	const start = performance.now()
	const site = await buildSite(config, {
		rootDir,
		loadAdapter: staticLoadAdapter,
	})
	const elapsed = Math.round(performance.now() - start)

	const outDir = resolve(rootDir, config.outDir ?? '.catforge')
	await mkdir(outDir, { recursive: true })

	const outPath = resolve(outDir, 'site.json')
	await writeFile(outPath, JSON.stringify(site, null, 2), 'utf-8')

	const symbolCount = site.api.reduce(
		(sum, section) => sum + section.modules.reduce((m, mod) => m + mod.symbols.length, 0),
		0,
	)

	console.log(`\nBuilding "${site.name}"...\n`)
	console.log(`  Pages:       ${site.pages.length}`)
	console.log(`  API symbols: ${symbolCount}`)
	console.log(`  Output:      ${outPath}\n`)
	console.log(`Done in ${elapsed}ms`)

	// Build static HTML site
	const __dirname = dirname(fileURLToPath(import.meta.url))
	const uiDir = resolve(__dirname, '../../ui/fuma')
	const htmlOutDir = resolve(outDir, 'dist')
	const buildEnv = { ...process.env, CATFORGE_SITE_JSON: outPath }

	// 1. Client build
	console.log(`\nBuilding static site...`)
	execFileSync('bunx', ['vite', 'build', '--outDir', htmlOutDir, '--emptyOutDir'], {
		cwd: uiDir,
		env: buildEnv,
		stdio: 'inherit',
	})

	// 2. SSR build
	const serverOutDir = resolve(htmlOutDir, 'server')
	console.log(`\nBuilding SSR bundle...`)
	execFileSync('bunx', ['vite', 'build', '--ssr', 'src/prerender.ts', '--outDir', serverOutDir], {
		cwd: uiDir,
		env: buildEnv,
		stdio: 'inherit',
	})

	// 3. Prerender all routes
	execFileSync('bun', ['run', resolve(serverOutDir, 'prerender.js')], {
		cwd: uiDir,
		env: { ...process.env, CATFORGE_OUT_DIR: htmlOutDir },
		stdio: 'inherit',
	})

	// 4. Clean up SSR artifacts
	rmSync(serverOutDir, { recursive: true })

	console.log(`\nStatic site: ${htmlOutDir}`)
}