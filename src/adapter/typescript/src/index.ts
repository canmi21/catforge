// Public API for the TypeScript adapter.

import type { DocOutput, TsSymbol } from '@catforge/schema'
import { readFile } from 'node:fs/promises'
import { convertTypedoc } from './convert.js'

export type { ConvertOptions } from './convert.js'
export { convertTypedoc } from './convert.js'

export async function convertTypedocFile(
	path: string,
	options?: { projectVersion?: string; schemaVersion?: string },
): Promise<DocOutput<TsSymbol>> {
	let content: string
	try {
		content = await readFile(path, 'utf-8')
	} catch (err) {
		throw new Error(`Failed to read TypeDoc JSON at "${path}": ${(err as Error).message}`)
	}

	let json: unknown
	try {
		json = JSON.parse(content)
	} catch {
		throw new Error(`Invalid JSON in TypeDoc file "${path}"`)
	}

	return convertTypedoc(json, options)
}
