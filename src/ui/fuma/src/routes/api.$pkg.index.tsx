/* src/ui/fuma/src/routes/api.$pkg.index.tsx */

import { createFileRoute, Link } from '@tanstack/react-router'
import siteData from '~/lib/site-data.js'
import { useSetToc } from '~/lib/toc-context.js'

export const Route = createFileRoute('/api/$pkg/')({
	component: ApiPackagePage,
})

function ApiPackagePage() {
	const { pkg } = Route.useParams()
	const packageName = decodeURIComponent(pkg)
	const section = siteData.api.find((s) => s.packageName === packageName)

	useSetToc([])

	if (!section) {
		return (
			<div>
				<h1>Not Found</h1>
				<p>Package "{packageName}" does not exist.</p>
			</div>
		)
	}

	return (
		<div>
			<h1>{section.packageName}</h1>
			<p className="api-meta">{section.language}</p>
			<table className="api-module-table">
				<thead>
					<tr>
						<th>Module</th>
						<th>Symbols</th>
					</tr>
				</thead>
				<tbody>
					{section.modules.map((mod) => (
						<tr key={mod.path}>
							<td>
								<Link to="/api/$pkg/$mod" params={{ pkg, mod: mod.path }}>
									{mod.name}
								</Link>
							</td>
							<td>{mod.symbols.length}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
