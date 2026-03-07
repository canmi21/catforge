import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { createRouter } from './router.js'
import './styles/global.css'
import './styles/code.css'
import './styles/api.css'

const router = createRouter()

hydrateRoot(
	document.getElementById('root')!,
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
