import { renderToString } from 'react-dom/server'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRouter } from './router.js'

export async function render(url: string): Promise<string> {
	const router = createRouter()
	const history = createMemoryHistory({ initialEntries: [url] })
	router.update({ history })
	await router.load()

	return renderToString(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	)
}
