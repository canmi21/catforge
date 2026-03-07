import { Link, useRouterState } from '@tanstack/react-router'
import type { ProcessedPage } from '~/lib/site-data.js'

interface SidebarItemProps {
	page: ProcessedPage
	basePath: string
}

export function SidebarItem({ page, basePath }: SidebarItemProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const href = `${basePath}/${page.path}`
	const isActive = pathname === href
	const hasChildren = page.children.length > 0
	const sortedChildren = [...page.children].sort((a, b) => a.order - b.order)

	if (!hasChildren) {
		return (
			<li className="sidebar-leaf">
				<Link to={href} className={isActive ? 'active' : ''}>
					{page.title}
				</Link>
			</li>
		)
	}

	return (
		<li className="sidebar-group">
			<details open>
				<summary className="sidebar-group-label">
					{page.html ? (
						<Link to={href} className={isActive ? 'active' : ''}>
							{page.title}
						</Link>
					) : (
						page.title
					)}
				</summary>
				<ul className="sidebar-list nested">
					{sortedChildren.map((child) => (
						<SidebarItem key={child.path} page={child} basePath={basePath} />
					))}
				</ul>
			</details>
		</li>
	)
}
