/* src/ui/fuma/src/prerender.ts */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { render } from './entry-server.js'
import { collectRoutes } from './lib/route-utils.js'
import siteData from '~/lib/site-data.js'

const outDir = process.env.CATFORGE_OUT_DIR
if (!outDir) {
	console.error('CATFORGE_OUT_DIR is required')
	process.exit(1)
}

const template = readFileSync(resolve(outDir, 'index.html'), 'utf-8')
const routes = collectRoutes(siteData)

console.log(`Prerendering ${routes.length} routes...`)

for (const route of routes) {
	const html = await render(route)
	const page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`)

	const filePath =
		route === '/' ? resolve(outDir, 'index.html') : resolve(outDir, route.slice(1), 'index.html')

	mkdirSync(dirname(filePath), { recursive: true })
	writeFileSync(filePath, page, 'utf-8')
	console.log(`  ${route}`)
}

console.log(`\nPrerendered ${routes.length} routes`)
