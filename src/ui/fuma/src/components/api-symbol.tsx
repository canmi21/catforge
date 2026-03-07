/* src/ui/fuma/src/components/api-symbol.tsx */

import type { BaseSymbol, TsParam, TsEnumMember } from '@catforge/schema'
import '~/styles/api.css'

interface ApiSymbolProps {
	symbol: BaseSymbol
}

export function ApiSymbol({ symbol }: ApiSymbolProps) {
	// Narrow to TS-specific fields if present
	const params: TsParam[] | undefined =
		'params' in symbol ? (symbol.params as TsParam[]) : undefined
	const members: TsEnumMember[] | undefined =
		'members' in symbol ? (symbol.members as TsEnumMember[]) : undefined

	return (
		<div className="api-symbol-card" id={symbol.name}>
			<div className="api-symbol-header">
				<span className={`api-kind-badge kind-${symbol.kind}`}>{symbol.kind}</span>
				<a href={`#${symbol.name}`} className="api-symbol-name">
					{symbol.name}
				</a>
			</div>

			<pre className="api-signature">
				<code>{symbol.signature}</code>
			</pre>

			{symbol.doc && <p className="api-symbol-doc">{symbol.doc}</p>}

			{params && params.length > 0 && (
				<div className="api-params">
					<h4>Parameters</h4>
					<table className="api-params-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Type</th>
								<th>Optional</th>
								<th>Default</th>
							</tr>
						</thead>
						<tbody>
							{params.map((p) => (
								<tr key={p.name}>
									<td>
										<code>{p.name}</code>
									</td>
									<td>
										<code>{p.type}</code>
									</td>
									<td>{p.optional ? 'Yes' : 'No'}</td>
									<td>{p.default ? <code>{p.default}</code> : '-'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{members && members.length > 0 && (
				<div className="api-members">
					<h4>Members</h4>
					<ul>
						{members.map((m) => (
							<li key={m.name}>
								<code>{m.name}</code>
								{m.value !== undefined && <span> = {m.value}</span>}
							</li>
						))}
					</ul>
				</div>
			)}

			<p className="api-location">
				{symbol.location.file}:{symbol.location.line}
			</p>
		</div>
	)
}
