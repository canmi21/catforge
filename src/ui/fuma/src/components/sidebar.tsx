import siteData from '~/lib/site-data.js'
import { SidebarItem } from './sidebar-item.js'
import type { ProcessedPage } from '~/lib/site-data.js'
import type { ApiSection } from '@catforge/schema'
import '~/styles/sidebar.css'

export function Sidebar() {
	// Filter out the "index" page (shown on /) from doc nav
	const docPages = siteData.pages.filter((p) => p.slug !== 'index')

	return (
		<nav className="site-sidebar">
			{docPages.length > 0 && (
				<section className="sidebar-section">
					<h3 className="sidebar-heading">Docs</h3>
					<ul className="sidebar-list">
						{sortPages(docPages).map((page) => (
							<SidebarItem key={page.path} page={page} basePath="/docs" />
						))}
					</ul>
				</section>
			)}
			{siteData.api.length > 0 && (
				<section className="sidebar-section">
					<h3 className="sidebar-heading">API Reference</h3>
					<ul className="sidebar-list">
						{siteData.api.map((section) => (
							<ApiSidebarSection key={section.packageName} section={section} />
						))}
					</ul>
				</section>
			)}
		</nav>
	)
}

function ApiSidebarSection({ section }: { section: ApiSection }) {
	const pkgEncoded = encodeURIComponent(section.packageName)
	return (
		<li className="sidebar-group">
			<details open>
				<summary className="sidebar-group-label">{section.packageName}</summary>
				<ul className="sidebar-list nested">
					{section.modules.map((mod) => (
						<li key={mod.path} className="sidebar-leaf">
							<a href={`/api/${pkgEncoded}/${mod.path}`}>{mod.name}</a>
						</li>
					))}
				</ul>
			</details>
		</li>
	)
}

function sortPages(pages: ProcessedPage[]): ProcessedPage[] {
	return [...pages].sort((a, b) => a.order - b.order)
}
