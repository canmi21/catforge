import type { ProcessedPage } from './site-data.js'

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

// Find the home page (lowest order among root pages with content)
export function findHomePage(
	pages: ProcessedPage[],
): ProcessedPage | undefined {
	const flat = flattenPages(pages)
	const withContent = flat.filter((p) => p.html)
	withContent.sort((a, b) => a.order - b.order)
	return withContent[0]
}
