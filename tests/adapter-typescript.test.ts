import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { convertTypedocFile } from '../src/adapter/typescript/src/index.js'
import { convertTypedoc } from '../src/adapter/typescript/src/convert.js'
import type {
	DocOutput,
	Module,
	TsInterface,
	TsSymbol,
	TsTypeAlias,
} from '../src/schema/src/index.js'

const fixture = JSON.parse(
	readFileSync(resolve(__dirname, 'fixtures/schema.typedoc.json'), 'utf-8'),
)

function getOutput(): DocOutput<TsSymbol> {
	return convertTypedoc(fixture, { projectVersion: '0.0.1' })
}

function findModule(output: DocOutput<TsSymbol>, name: string): Module<TsSymbol> {
	const mod = output.modules?.find((m) => m.name === name)
	if (!mod) throw new Error(`Module "${name}" not found`)
	return mod
}

function findSymbol(mod: Module<TsSymbol>, name: string): TsSymbol {
	const sym = mod.symbols.find((s) => s.name === name)
	if (!sym) throw new Error(`Symbol "${name}" not found in module "${mod.name}"`)
	return sym
}

describe('convertTypedoc', () => {
	it('produces correct top-level structure', () => {
		const output = getOutput()
		expect(output.language).toBe('typescript')
		expect(output.schemaVersion).toBe('1.0')
		expect(output.projectVersion).toBe('0.0.1')
		expect(output.generatedAt).toBeTruthy()
	})

	it('groups symbols into correct modules (no empty index module)', () => {
		const output = getOutput()
		const moduleNames = output.modules!.map((m) => m.name).sort()
		expect(moduleNames).toEqual(['base', 'command', 'config', 'output', 'typescript'])
	})

	it('assigns correct symbol counts per module', () => {
		const output = getOutput()
		const counts: Record<string, number> = {}
		for (const mod of output.modules!) {
			counts[mod.name] = mod.symbols.length
		}
		// base: BaseSymbol, Module, SourceLocation, Visibility (4)
		expect(counts.base).toBe(4)
		// command: Command, CommandArg, CommandFlag (3)
		expect(counts.command).toBe(3)
		// config: ConfigDoc, ConfigField (2)
		expect(counts.config).toBe(2)
		// output: CacheFileEntry, CacheMeta, DocOutput, Page (4)
		expect(counts.output).toBe(4)
		// typescript: TsClass, TsEnum, TsEnumMember, TsFunction, TsInterface, TsParam, TsTypeAlias, TsSymbol (8)
		expect(counts.typescript).toBe(8)
	})

	it('converts BaseSymbol as TsInterface with correct fields', () => {
		const output = getOutput()
		const base = findModule(output, 'base')
		const sym = findSymbol(base, 'BaseSymbol') as TsInterface

		expect(sym.kind).toBe('interface')
		expect(sym.path).toBe('base/BaseSymbol')
		expect(sym.location.file).toBe('base.ts')
		expect(sym.location.line).toBe(13)
		expect(sym.signature).toBe('export interface BaseSymbol { ... }')
		expect(sym.typeParams).toBeUndefined()
		expect(sym.extends).toBeUndefined()
	})

	it('extracts type parameters on Module', () => {
		const output = getOutput()
		const base = findModule(output, 'base')
		const mod = findSymbol(base, 'Module') as TsInterface

		expect(mod.kind).toBe('interface')
		expect(mod.typeParams).toEqual(['S'])
		expect(mod.signature).toContain('Module<S extends BaseSymbol = BaseSymbol>')
	})

	it('extracts type parameters on DocOutput', () => {
		const output = getOutput()
		const outputMod = findModule(output, 'output')
		const docOutput = findSymbol(outputMod, 'DocOutput') as TsInterface

		expect(docOutput.typeParams).toEqual(['S'])
		expect(docOutput.signature).toContain('<S extends BaseSymbol = BaseSymbol>')
	})

	it('extracts extends on TsFunction interface', () => {
		const output = getOutput()
		const ts = findModule(output, 'typescript')
		const sym = findSymbol(ts, 'TsFunction') as TsInterface

		expect(sym.kind).toBe('interface')
		expect(sym.extends).toEqual(['BaseSymbol'])
		expect(sym.signature).toContain('extends BaseSymbol')
	})

	it('converts Visibility as TsTypeAlias with union signature', () => {
		const output = getOutput()
		const base = findModule(output, 'base')
		const sym = findSymbol(base, 'Visibility') as TsTypeAlias

		expect(sym.kind).toBe('type')
		expect(sym.path).toBe('base/Visibility')
		expect(sym.signature).toContain('"public"')
		expect(sym.signature).toContain('|')
	})

	it('converts TsSymbol as TsTypeAlias with reference union', () => {
		const output = getOutput()
		const ts = findModule(output, 'typescript')
		const sym = findSymbol(ts, 'TsSymbol') as TsTypeAlias

		expect(sym.kind).toBe('type')
		expect(sym.signature).toContain('TsFunction')
		expect(sym.signature).toContain('TsInterface')
		expect(sym.signature).toContain('TsClass')
		expect(sym.signature).toContain('TsTypeAlias')
		expect(sym.signature).toContain('TsEnum')
	})

	it('provides source location for every symbol', () => {
		const output = getOutput()
		for (const mod of output.modules!) {
			for (const sym of mod.symbols) {
				expect(sym.location.file).not.toBe('unknown')
				expect(sym.location.line).toBeGreaterThan(0)
			}
		}
	})

	it('rejects invalid input', () => {
		expect(() => convertTypedoc(null)).toThrow('expected an object')
		expect(() => convertTypedoc({})).toThrow('expected kind=1')
		expect(() => convertTypedoc({ kind: 999 })).toThrow('expected kind=1')
	})
})

describe('convertTypedocFile error paths', () => {
	it('reports file path when file does not exist', async () => {
		await expect(convertTypedocFile('/nonexistent/file.json')).rejects.toThrow(
			/Failed to read TypeDoc JSON at "\/nonexistent\/file\.json"/,
		)
	})

	it('reports file path when JSON is invalid', async () => {
		// __filename is a valid file but not valid JSON
		await expect(convertTypedocFile(__filename)).rejects.toThrow(/Invalid JSON in TypeDoc file/)
	})
})
