/* src/ui/fuma/src/routes/__root.tsx */

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Layout } from '~/components/layout.js'
import { TocProvider } from '~/lib/toc-context.js'

export const Route = createRootRoute({
	component: RootLayout,
})

function RootLayout() {
	return (
		<TocProvider>
			<Layout>
				<Outlet />
			</Layout>
		</TocProvider>
	)
}