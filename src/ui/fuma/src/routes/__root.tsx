import { createRootRoute, Outlet, useMatches } from '@tanstack/react-router'
import { Layout } from '~/components/layout.js'

export const Route = createRootRoute({
	component: RootLayout,
})

function RootLayout() {
	// Routes expose toc via static data so Layout can render the TOC panel
	const matches = useMatches()
	const last = matches[matches.length - 1]
	const toc = (last?.staticData as any)?.toc

	return (
		<Layout toc={toc}>
			<Outlet />
		</Layout>
	)
}
