import type { BaseSymbol } from '@catforge/schema'
import { ApiSymbol } from './api-symbol.js'

// Group order for display
const KIND_ORDER = ['interface', 'class', 'type', 'function', 'enum'] as const

const KIND_LABELS: Record<string, string> = {
	interface: 'Interfaces',
	class: 'Classes',
	type: 'Type Aliases',
	function: 'Functions',
	enum: 'Enums',
}

interface ApiModuleProps {
	symbols: BaseSymbol[]
}

export function ApiModule({ symbols }: ApiModuleProps) {
	const grouped = new Map<string, BaseSymbol[]>()
	for (const sym of symbols) {
		const list = grouped.get(sym.kind) ?? []
		list.push(sym)
		grouped.set(sym.kind, list)
	}

	// Display groups in a stable order
	const orderedKinds = [...grouped.keys()].sort(
		(a, b) =>
			(KIND_ORDER.indexOf(a as any) ?? 99) -
			(KIND_ORDER.indexOf(b as any) ?? 99),
	)

	return (
		<div className="api-module">
			{orderedKinds.map((kind) => (
				<section key={kind} className="api-kind-group">
					<h2>{KIND_LABELS[kind] ?? kind}</h2>
					{grouped.get(kind)!.map((sym) => (
						<ApiSymbol key={sym.name} symbol={sym} />
					))}
				</section>
			))}
		</div>
	)
}
