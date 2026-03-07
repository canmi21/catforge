import type { ProcessedPage, ProcessedSite } from './site-data.js'

export function findPageByPath(
	pageMap: Record<string, ProcessedPage>,
	path: string,
): ProcessedPage | undefined {
	return pageMap[path]
}

export function flattenPages(pages: ProcessedPage[]): ProcessedPage[] {
	const result: ProcessedPage[] = []
	for (const page of pages) {
		result.push(page)
		result.push(...flattenPages(page.children))
	}
	return result
}

// Enumerate all prerenderable routes from site data
export function collectRoutes(site: ProcessedSite): string[] {
	const routes: string[] = ['/']

	// Doc pages (skip home page -- already rendered at /)
	const home = findHomePage(site.pages)
	for (const page of flattenPages(site.pages)) {
		if (page.html && page !== home) {
			routes.push(`/docs/${page.path}`)
		}
	}

	// API routes
	if (site.api.length > 0) {
		routes.push('/api')
		for (const section of site.api) {
			const encodedPkg = encodeURIComponent(section.packageName)
			routes.push(`/api/${encodedPkg}`)
			for (const mod of section.modules) {
				routes.push(`/api/${encodedPkg}/${mod.path}`)
			}
		}
	}

	return routes
}

// Find the home page (lowest order among root pages with content)
export function findHomePage(
	pages: ProcessedPage[],
): ProcessedPage | undefined {
	const flat = flattenPages(pages)
	const withContent = flat.filter((p) => p.html)
	withContent.sort((a, b) => a.order - b.order)
	return withContent[0]
}
