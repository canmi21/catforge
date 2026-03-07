// Main conversion: TypeDoc reflection tree → DocOutput<TsSymbol>.

import type {
	DocOutput,
	Module,
	TsClass,
	TsEnum,
	TsFunction,
	TsInterface,
	TsSymbol,
	TsTypeAlias,
} from '@catforge/schema'
import type { TdProject, TdReflection } from './typedoc-types.js'
import { ReflectionKind } from './typedoc-types.js'
import { buildSignature, commentToString, typeToString } from './stringify.js'

export interface ConvertOptions {
	projectVersion?: string
	schemaVersion?: string
}

export function convertTypedoc(json: unknown, options: ConvertOptions = {}): DocOutput<TsSymbol> {
	const project = validateProject(json)
	const modules = buildModuleTree(project)

	return {
		schemaVersion: options.schemaVersion ?? '1.0',
		language: 'typescript',
		projectVersion: options.projectVersion,
		generatedAt: new Date().toISOString(),
		modules: modules.length ? modules : undefined,
	}
}

// --- Validation ---

function validateProject(json: unknown): TdProject {
	if (!json || typeof json !== 'object') {
		throw new Error('Invalid TypeDoc JSON: expected an object')
	}
	const obj = json as Record<string, unknown>
	if (obj.kind !== ReflectionKind.Project) {
		throw new Error(
			`Invalid TypeDoc JSON: expected kind=${ReflectionKind.Project} (Project), got ${obj.kind}`,
		)
	}
	return json as TdProject
}

// --- Module tree ---

function buildModuleTree(project: TdProject): Module<TsSymbol>[] {
	const children = project.children ?? []

	// Group by canonical source file
	const fileGroups = new Map<string, TdReflection[]>()
	for (const child of children) {
		const fileName = getSourceFile(child, project)
		if (!fileName) continue
		// Skip barrel file — re-exports are attributed to their original source
		if (fileName === 'index.ts') continue

		let group = fileGroups.get(fileName)
		if (!group) {
			group = []
			fileGroups.set(fileName, group)
		}
		group.push(child)
	}

	const modules: Module<TsSymbol>[] = []
	for (const [fileName, reflections] of fileGroups) {
		const moduleName = fileName.replace(/\.tsx?$/, '')
		const symbols: TsSymbol[] = []

		for (const refl of reflections) {
			const symbol = convertReflection(refl, moduleName)
			if (symbol) symbols.push(symbol)
		}

		if (symbols.length) {
			modules.push({
				name: moduleName,
				path: moduleName,
				symbols,
				modules: [],
			})
		}
	}

	modules.sort((a, b) => a.name.localeCompare(b.name))
	return modules
}

// Resolve canonical source file via symbolIdMap, falling back to sources.
function getSourceFile(refl: TdReflection, project: TdProject): string | undefined {
	if (project.symbolIdMap) {
		const entry = project.symbolIdMap[String(refl.id)]
		if (entry?.packagePath) {
			const parts = entry.packagePath.split('/')
			return parts[parts.length - 1]
		}
	}
	return refl.sources?.[0]?.fileName
}

// --- Reflection dispatch ---

function convertReflection(refl: TdReflection, modulePath: string): TsSymbol | undefined {
	switch (refl.kind) {
		case ReflectionKind.Interface:
			return convertInterface(refl, modulePath)
		case ReflectionKind.TypeAlias:
			return convertTypeAlias(refl, modulePath)
		case ReflectionKind.Class:
			return convertClass(refl, modulePath)
		case ReflectionKind.Function:
			return convertFunction(refl, modulePath)
		case ReflectionKind.Enum:
			return convertEnum(refl, modulePath)
		default:
			console.warn(`[adapter-typescript] Unknown kind ${refl.kind} for "${refl.name}", skipping`)
			return undefined
	}
}

// --- Shared helpers ---

function makeLocation(refl: TdReflection) {
	const src = refl.sources?.[0]
	return {
		file: src?.fileName ?? 'unknown',
		line: src?.line ?? 0,
		column: src?.character,
	}
}

function extractTypeParams(refl: TdReflection): string[] | undefined {
	if (!refl.typeParameters?.length) return undefined
	return refl.typeParameters.map((tp) => tp.name)
}

// --- Kind converters ---

function convertInterface(refl: TdReflection, modulePath: string): TsInterface {
	const ext = refl.extendedTypes?.map(typeToString)
	return {
		name: refl.name,
		path: `${modulePath}/${refl.name}`,
		kind: 'interface',
		signature: buildSignature(refl),
		doc: commentToString(refl.comment),
		location: makeLocation(refl),
		typeParams: extractTypeParams(refl),
		extends: ext?.length ? ext : undefined,
	}
}

function convertTypeAlias(refl: TdReflection, modulePath: string): TsTypeAlias {
	return {
		name: refl.name,
		path: `${modulePath}/${refl.name}`,
		kind: 'type',
		signature: buildSignature(refl),
		doc: commentToString(refl.comment),
		location: makeLocation(refl),
		typeParams: extractTypeParams(refl),
	}
}

function convertClass(refl: TdReflection, modulePath: string): TsClass {
	const ext = refl.extendedTypes?.length ? typeToString(refl.extendedTypes[0]) : undefined
	const impl = refl.implementedTypes?.map(typeToString)
	return {
		name: refl.name,
		path: `${modulePath}/${refl.name}`,
		kind: 'class',
		signature: buildSignature(refl),
		doc: commentToString(refl.comment),
		location: makeLocation(refl),
		typeParams: extractTypeParams(refl),
		extends: ext,
		implements: impl?.length ? impl : undefined,
	}
}

function convertFunction(refl: TdReflection, modulePath: string): TsFunction {
	const sig = refl.signatures?.[0]
	const params = (sig?.parameters ?? []).map((p) => ({
		name: p.name,
		type: p.type ? typeToString(p.type) : 'unknown',
		optional: !!p.flags.isOptional,
		default: p.defaultValue,
	}))
	const returnType = sig?.type ? typeToString(sig.type) : 'void'
	const typeParams = sig?.typeParameters?.map((tp) => tp.name)

	return {
		name: refl.name,
		path: `${modulePath}/${refl.name}`,
		kind: 'function',
		signature: buildSignature(refl),
		doc: commentToString(refl.comment) ?? commentToString(sig?.comment),
		location: makeLocation(refl),
		params,
		returnType,
		typeParams: typeParams?.length ? typeParams : undefined,
	}
}

function convertEnum(refl: TdReflection, modulePath: string): TsEnum {
	const members = (refl.children ?? [])
		.filter((c) => c.kind === ReflectionKind.EnumMember)
		.map((c) => ({
			name: c.name,
			value:
			c.type?.type === 'literal' && c.type.value !== null && c.type.value !== undefined
				? String(c.type.value)
				: undefined,
		}))

	return {
		name: refl.name,
		path: `${modulePath}/${refl.name}`,
		kind: 'enum',
		signature: buildSignature(refl),
		doc: commentToString(refl.comment),
		location: makeLocation(refl),
		members,
	}
}
