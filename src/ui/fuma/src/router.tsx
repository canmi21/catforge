import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './route-tree.gen.js'

export function createRouter() {
	return createTanStackRouter({ routeTree })
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>
	}
}
