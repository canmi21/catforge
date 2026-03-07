import { join } from 'node:path'
import type { ApiSection, BaseSymbol, DocOutput, Site } from '@catforge/schema'
import type { CatforgeConfig, PackageEntry } from './config.js'
import { resolveConfig } from './config.js'
import { scanMarkdown } from './markdown.js'

export type AdapterLoader = (entry: PackageEntry, rootDir: string) => Promise<DocOutput<BaseSymbol>>

// Adapter name -> workspace source path (relative to rootDir)
const adapterSourcePaths: Record<string, string> = {
	typescript: 'src/adapter/typescript/src/index.js',
}

const defaultLoadAdapter: AdapterLoader = async (entry, rootDir) => {
	const sourcePath = adapterSourcePaths[entry.adapter]
	const specifier = sourcePath ? join(rootDir, sourcePath) : entry.adapter
	const mod = await import(specifier)

	if (entry.adapter === 'typescript') {
		return mod.convertTypedocFile(entry.source)
	}

	// Generic adapter: expect a default export function(source) -> DocOutput
	if (typeof mod.default === 'function') {
		return mod.default(entry.source)
	}

	throw new Error(`Adapter "${entry.adapter}" has no recognized entry point`)
}

export async function buildSite(
	config: CatforgeConfig,
	options?: { rootDir?: string; loadAdapter?: AdapterLoader },
): Promise<Site> {
	const rootDir = options?.rootDir ?? process.cwd()
	const loadAdapter = options?.loadAdapter ?? defaultLoadAdapter
	const resolved = await resolveConfig(config, rootDir)

	// Build API sections from adapter outputs
	const api: ApiSection[] = []
	for (const entry of resolved.packages) {
		const output = await loadAdapter(entry, rootDir)
		api.push({
			packageName: entry.name ?? entry.source,
			language: output.language,
			modules: output.modules ?? [],
		})
	}

	// Build page tree from markdown
	const pages = await scanMarkdown(resolved.docsDir)

	return {
		name: resolved.name,
		version: resolved.version,
		generatedAt: new Date().toISOString(),
		pages,
		api,
	}
}
