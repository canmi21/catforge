import { createFileRoute } from '@tanstack/react-router'
import siteData from '~/lib/site-data.js'
import { ApiModule } from '~/components/api-module.js'
import { useSetToc } from '~/lib/toc-context.js'
import type { TocEntry } from '~/lib/site-data.js'

export const Route = createFileRoute('/api/$pkg/$mod')({
	component: ApiModulePage,
})

function ApiModulePage() {
	const { pkg, mod: modPath } = Route.useParams()
	const packageName = decodeURIComponent(pkg)
	const section = siteData.api.find((s) => s.packageName === packageName)
	const mod = section?.modules.find((m) => m.path === modPath)

	// Build TOC from symbol names
	const toc: TocEntry[] = mod
		? mod.symbols.map((s) => ({ depth: 3, id: s.name, text: s.name }))
		: []
	useSetToc(toc)

	if (!section || !mod) {
		return (
			<div>
				<h1>Not Found</h1>
				<p>
					Module "{modPath}" not found in "{packageName}".
				</p>
			</div>
		)
	}

	return (
		<div>
			<h1>{mod.name}</h1>
			{mod.doc && <p className="api-meta">{mod.doc}</p>}
			<p className="api-meta">
				{packageName} &middot; {mod.symbols.length} symbols
			</p>
			<ApiModule symbols={mod.symbols} />
		</div>
	)
}
