import { createFileRoute, Link } from '@tanstack/react-router'
import siteData from '~/lib/site-data.js'
import { useSetToc } from '~/lib/toc-context.js'
import '~/styles/api.css'

export const Route = createFileRoute('/api/')({
	component: ApiIndexPage,
})

function ApiIndexPage() {
	useSetToc([])

	return (
		<div>
			<h1>API Reference</h1>
			{siteData.api.map((section) => {
				const symbolCount = section.modules.reduce(
					(sum, mod) => sum + mod.symbols.length,
					0,
				)
				return (
					<div key={section.packageName} className="api-package-card">
						<h2>
							<Link
								to="/api/$pkg"
								params={{ pkg: encodeURIComponent(section.packageName) }}
							>
								{section.packageName}
							</Link>
						</h2>
						<p className="api-meta">
							{section.language} &middot; {section.modules.length} modules &middot;{' '}
							{symbolCount} symbols
						</p>
					</div>
				)
			})}
		</div>
	)
}
