// Minimal type definitions for TypeDoc JSON output (schema v2.0).
// Hand-written from actual output to avoid runtime dependency on typedoc.

export const ReflectionKind = {
	Project: 1,
	Enum: 8,
	EnumMember: 16,
	Variable: 32,
	Function: 64,
	Class: 128,
	Interface: 256,
	Property: 1024,
	Method: 2048,
	CallSignature: 4096,
	Parameter: 32768,
	TypeLiteral: 65536,
	TypeParameter: 131072,
	TypeAlias: 2097152,
} as const

// --- Type nodes ---

export interface TdIntrinsicType {
	type: 'intrinsic'
	name: string
}

export interface TdLiteralType {
	type: 'literal'
	value: string | number | boolean | null
}

export interface TdReferenceType {
	type: 'reference'
	target: number | Record<string, unknown>
	name: string
	package?: string
	refersToTypeParameter?: boolean
	typeArguments?: TdType[]
}

export interface TdUnionType {
	type: 'union'
	types: TdType[]
}

export interface TdIntersectionType {
	type: 'intersection'
	types: TdType[]
}

export interface TdArrayType {
	type: 'array'
	elementType: TdType
}

export interface TdTupleType {
	type: 'tuple'
	elements?: TdType[]
}

export interface TdReflectionType {
	type: 'reflection'
	declaration: TdReflection
}

export interface TdIndexedAccessType {
	type: 'indexedAccess'
	objectType: TdType
	indexType: TdType
}

export interface TdMappedType {
	type: 'mapped'
	parameter: string
	parameterType: TdType
	templateType: TdType
}

export interface TdConditionalType {
	type: 'conditional'
	checkType: TdType
	extendsType: TdType
	trueType: TdType
	falseType: TdType
}

export interface TdPredicateType {
	type: 'predicate'
	name: string
	asserts?: boolean
	targetType?: TdType
}

export interface TdQueryType {
	type: 'query'
	queryType: TdType
}

export interface TdTemplateLiteralType {
	type: 'templateLiteral'
	head: string
	tail: Array<[TdType, string]>
}

export type TdType =
	| TdIntrinsicType
	| TdLiteralType
	| TdReferenceType
	| TdUnionType
	| TdIntersectionType
	| TdArrayType
	| TdTupleType
	| TdReflectionType
	| TdIndexedAccessType
	| TdMappedType
	| TdConditionalType
	| TdPredicateType
	| TdQueryType
	| TdTemplateLiteralType

// --- Comment ---

export interface TdComment {
	summary?: Array<{ kind: string; text: string }>
	blockTags?: Array<{
		tag: string
		name?: string
		content: Array<{ kind: string; text: string }>
	}>
}

// --- Source location ---

export interface TdSource {
	fileName: string
	line: number
	character: number
}

// --- Flags ---

export interface TdFlags {
	isOptional?: boolean
	isInherited?: boolean
	isRest?: boolean
}

// --- Type parameter ---

export interface TdTypeParameter {
	id: number
	name: string
	variant: 'typeParam'
	kind: number
	flags: TdFlags
	type?: TdType
	default?: TdType
}

// --- Signature (call/construct) ---

export interface TdSignature {
	id: number
	name: string
	variant: 'signature'
	kind: number
	flags: TdFlags
	comment?: TdComment
	sources?: TdSource[]
	parameters?: TdReflection[]
	typeParameters?: TdTypeParameter[]
	type?: TdType
}

// --- Reflection (generic node) ---

export interface TdReflection {
	id: number
	name: string
	variant: string
	kind: number
	flags: TdFlags
	comment?: TdComment
	children?: TdReflection[]
	sources?: TdSource[]
	type?: TdType
	typeParameters?: TdTypeParameter[]
	signatures?: TdSignature[]
	extendedTypes?: TdType[]
	implementedTypes?: TdType[]
	defaultValue?: string
}

// --- Project root ---

export interface TdProject extends TdReflection {
	schemaVersion: string
	variant: 'project'
	kind: 1
	packageName?: string
	symbolIdMap?: Record<string, { packageName: string; packagePath: string; qualifiedName: string }>
}
