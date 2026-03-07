/* src/ui/fuma/src/lib/site-data.ts */

import type { ApiSection } from '@catforge/schema'

export interface TocEntry {
	depth: number
	id: string
	text: string
}

export interface ProcessedPage {
	title: string
	slug: string
	path: string
	html: string
	toc: TocEntry[]
	order: number
	children: ProcessedPage[]
}

export interface ProcessedSite {
	name: string
	version?: string
	pages: ProcessedPage[]
	api: ApiSection[]
	pageMap: Record<string, ProcessedPage>
}

// Re-export from virtual module for consumers
import siteData from 'virtual:site-data'
export default siteData as ProcessedSite
