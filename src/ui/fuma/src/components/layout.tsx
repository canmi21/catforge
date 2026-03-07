import type { ReactNode } from 'react'
import siteData from '~/lib/site-data.js'
import { Sidebar } from './sidebar.js'
import { TocPanel } from './toc-panel.js'
import { useTocEntries } from '~/lib/toc-context.js'

export function Layout({ children }: { children: ReactNode }) {
	const toc = useTocEntries()
	return (
		<div className="site-layout">
			<header className="site-header">
				<span>{siteData.name}</span>
				{siteData.version && (
					<span className="version">v{siteData.version}</span>
				)}
			</header>
			<Sidebar />
			<main className="site-content">{children}</main>
			<TocPanel entries={toc} />
		</div>
	)
}
