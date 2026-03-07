/* src/schema/src/base.ts */

export interface SourceLocation {
	file: string
	line: number
	column?: number
}

export type Visibility = 'public' | 'private' | 'protected' | 'internal'

// Base symbol shared across all languages.
// Language adapters extend this interface and narrow `kind` to a string literal.
export interface BaseSymbol {
	name: string
	// Qualified path (e.g. "mod/sub.MyClass.method")
	path: string
	// Discriminant — each language defines its own literal values
	kind: string
	// Original-language signature, kept as-is for display
	signature: string
	doc?: string
	visibility?: Visibility
	location: SourceLocation
}

// Recursive module container that holds symbols and sub-modules
export interface Module<S extends BaseSymbol = BaseSymbol> {
	name: string
	path: string
	doc?: string
	symbols: S[]
	modules: Module<S>[]
}
