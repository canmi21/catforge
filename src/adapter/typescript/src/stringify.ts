/* src/adapter/typescript/src/stringify.ts */

// Type node → string conversion and signature reconstruction.

import type { TdComment, TdReflection, TdType, TdTypeParameter } from './typedoc-types.js'
import { ReflectionKind } from './typedoc-types.js'

export function typeToString(type: TdType): string {
	switch (type.type) {
		case 'intrinsic':
			return type.name

		case 'literal': {
			if (typeof type.value === 'string') return `"${type.value}"`
			if (type.value === null) return 'null'
			return String(type.value)
		}

		case 'reference': {
			let s = type.name
			if (type.typeArguments?.length) {
				s += `<${type.typeArguments.map(typeToString).join(', ')}>`
			}
			return s
		}

		case 'union':
			return type.types.map(typeToString).join(' | ')

		case 'intersection':
			return type.types.map(typeToString).join(' & ')

		case 'array': {
			const inner = typeToString(type.elementType)
			const needsParens =
				type.elementType.type === 'union' || type.elementType.type === 'intersection'
			return needsParens ? `(${inner})[]` : `${inner}[]`
		}

		case 'tuple':
			return `[${(type.elements ?? []).map(typeToString).join(', ')}]`

		case 'reflection':
			return reflectionTypeToString(type.declaration)

		case 'indexedAccess':
			return `${typeToString(type.objectType)}[${typeToString(type.indexType)}]`

		case 'templateLiteral': {
			const parts = [type.head]
			for (const [t, text] of type.tail) {
				parts.push(`\${${typeToString(t)}}${text}`)
			}
			return `\`${parts.join('')}\``
		}

		case 'query':
			return `typeof ${typeToString(type.queryType)}`

		case 'predicate':
			return type.targetType ? `${type.name} is ${typeToString(type.targetType)}` : type.name

		case 'mapped':
			return `{ [${type.parameter} in ${typeToString(type.parameterType)}]: ${typeToString(type.templateType)} }`

		case 'conditional':
			return [
				typeToString(type.checkType),
				'extends',
				typeToString(type.extendsType),
				'?',
				typeToString(type.trueType),
				':',
				typeToString(type.falseType),
			].join(' ')

		default:
			return 'unknown'
	}
}

function reflectionTypeToString(decl: TdReflection): string {
	// Inline object type
	if (decl.children?.length) {
		const props = decl.children.map((c) => {
			const opt = c.flags.isOptional ? '?' : ''
			const t = c.type ? typeToString(c.type) : 'unknown'
			return `${c.name}${opt}: ${t}`
		})
		return `{ ${props.join('; ')} }`
	}
	// Call signature
	if (decl.signatures?.length) {
		const sig = decl.signatures[0]
		const params = (sig.parameters ?? []).map((p) => {
			const opt = p.flags.isOptional ? '?' : ''
			const t = p.type ? typeToString(p.type) : 'unknown'
			return `${p.name}${opt}: ${t}`
		})
		const ret = sig.type ? typeToString(sig.type) : 'void'
		return `(${params.join(', ')}) => ${ret}`
	}
	return '{}'
}

function typeParamsToString(params: TdTypeParameter[]): string {
	const parts = params.map((p) => {
		let s = p.name
		if (p.type) s += ` extends ${typeToString(p.type)}`
		if (p.default) s += ` = ${typeToString(p.default)}`
		return s
	})
	return `<${parts.join(', ')}>`
}

// Reconstruct the original-language declaration signature.
export function buildSignature(refl: TdReflection): string {
	const { kind, name } = refl
	const tp = refl.typeParameters?.length ? typeParamsToString(refl.typeParameters) : ''

	if (kind === ReflectionKind.Interface) {
		const ext = refl.extendedTypes?.length
			? ` extends ${refl.extendedTypes.map(typeToString).join(', ')}`
			: ''
		return `export interface ${name}${tp}${ext} { ... }`
	}

	if (kind === ReflectionKind.TypeAlias) {
		const rhs = refl.type ? typeToString(refl.type) : 'unknown'
		return `export type ${name}${tp} = ${rhs}`
	}

	if (kind === ReflectionKind.Class) {
		const ext = refl.extendedTypes?.length ? ` extends ${typeToString(refl.extendedTypes[0])}` : ''
		const impl = refl.implementedTypes?.length
			? ` implements ${refl.implementedTypes.map(typeToString).join(', ')}`
			: ''
		return `export class ${name}${tp}${ext}${impl} { ... }`
	}

	if (kind === ReflectionKind.Function) {
		const sig = refl.signatures?.[0]
		if (!sig) return `export function ${name}()`
		const sigTp = sig.typeParameters?.length ? typeParamsToString(sig.typeParameters) : ''
		const params = (sig.parameters ?? []).map((p) => {
			const rest = p.flags.isRest ? '...' : ''
			const opt = p.flags.isOptional ? '?' : ''
			const t = p.type ? typeToString(p.type) : 'unknown'
			return `${rest}${p.name}${opt}: ${t}`
		})
		const ret = sig.type ? typeToString(sig.type) : 'void'
		return `export function ${name}${sigTp}(${params.join(', ')}): ${ret}`
	}

	if (kind === ReflectionKind.Enum) {
		const members = (refl.children ?? [])
			.filter((c) => c.kind === ReflectionKind.EnumMember)
			.map((c) => {
				if (
					c.type &&
					c.type.type === 'literal' &&
					c.type.value !== null &&
					c.type.value !== undefined
				) {
					return `${c.name} = ${JSON.stringify(c.type.value)}`
				}
				return c.name
			})
		return `export enum ${name} { ${members.join(', ')} }`
	}

	return `export ${name}`
}

export function commentToString(comment?: TdComment): string | undefined {
	if (!comment?.summary?.length) return undefined
	const text = comment.summary
		.map((part) => part.text)
		.join('')
		.trim()
	return text || undefined
}