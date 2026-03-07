/* src/docs/src/config.ts */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export interface PackageEntry {
	name?: string
	adapter: 'typescript' | (string & {})
	// Path to pre-generated adapter input (e.g., typedoc JSON)
	source: string
}

export interface CatforgeConfig {
	name: string
	packages: PackageEntry[]
	docsDir?: string // default: "docs/"
	outDir?: string // default: ".catforge/"
	versionFrom?: string // path to package.json to read version
}

export interface ResolvedConfig {
	name: string
	packages: PackageEntry[]
	docsDir: string
	outDir: string
	version?: string
}

export async function resolveConfig(
	config: CatforgeConfig,
	rootDir: string,
): Promise<ResolvedConfig> {
	const docsDir = resolve(rootDir, config.docsDir ?? 'docs')
	const outDir = resolve(rootDir, config.outDir ?? '.catforge')

	let version: string | undefined
	if (config.versionFrom) {
		const pkgPath = resolve(rootDir, config.versionFrom)
		let raw: string
		try {
			raw = await readFile(pkgPath, 'utf-8')
		} catch (err) {
			throw new Error(
				`Failed to read version from "${pkgPath}" (versionFrom: "${config.versionFrom}"): ${(err as Error).message}`,
			)
		}
		const pkg: { version?: string } = JSON.parse(raw)
		version = pkg.version
	}

	return {
		name: config.name,
		packages: config.packages,
		docsDir,
		outDir,
		version,
	}
}