import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
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
}
