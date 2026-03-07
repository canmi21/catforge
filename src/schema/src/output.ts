/* src/schema/src/output.ts */

import type { BaseSymbol, Module } from './base.js'
import type { Command } from './command.js'
import type { ConfigDoc } from './config.js'

// A free-form documentation page (guides, specs, etc.)
export interface Page {
	title: string
	slug: string
	content: string
}

// Root output — the unified document a single adapter run produces.
// All sections are optional; adapters populate what they can.
export interface DocOutput<S extends BaseSymbol = BaseSymbol> {
	schemaVersion: string
	language: string
	projectVersion?: string
	generatedAt: string // ISO 8601
	modules?: Module<S>[]
	commands?: Command[]
	configs?: ConfigDoc[]
	pages?: Page[]
}

// Per-file cache entry for incremental builds
export interface CacheFileEntry {
	path: string
	hash: string
	modifiedAt: string // ISO 8601
}

// Cache metadata — stored alongside output for diff-based rebuilds
export interface CacheMeta {
	schemaVersion: string
	generatedAt: string
	files: CacheFileEntry[]
}
