/* src/ui/fuma/src/plugins/vite-plugin-site-data.ts */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import type { Site, PageNode } from '@catforge/schema'
import type { ProcessedPage, ProcessedSite, TocEntry } from '../lib/site-data.js'

const VIRTUAL_ID = 'virtual:site-data'
const RESOLVED_ID = '\0' + VIRTUAL_ID

interface SiteDataPluginOptions {
	siteJsonPath?: string
}

// Collect heading elements from the rehype AST for TOC generation
function rehypeExtractToc(tocEntries: TocEntry[]) {
	return () => (tree: any) => {
		visit(tree, (node: any) => {
			if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
				const depth = parseInt(node.tagName[1])
				const id = node.properties?.id
				if (!id) return
				const text = extractText(node)
				tocEntries.push({ depth, id, text })
			}
		})
	}
}

function visit(node: any, fn: (node: any) => void) {
	fn(node)
	if (node.children) {
		for (const child of node.children) {
			visit(child, fn)
		}
	}
}

function extractText(node: any): string {
	if (node.type === 'text') return node.value
	if (!node.children) return ''
	return node.children.map(extractText).join('')
}

async function createProcessor() {
	const { unified } = await import('unified')
	const { default: remarkParse } = await import('remark-parse')
	const { default: remarkGfm } = await import('remark-gfm')
	const { default: remarkRehype } = await import('remark-rehype')
	const { default: rehypeSlug } = await import('rehype-slug')
	const { default: rehypeStringify } = await import('rehype-stringify')
	const { default: rehypeShiki } = await import('@shikijs/rehype')

	return async (markdown: string): Promise<{ html: string; toc: TocEntry[] }> => {
		const toc: TocEntry[] = []
		const processor = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkRehype)
			.use(rehypeSlug)
			.use(rehypeShiki, {
				themes: { light: 'github-light', dark: 'github-dark' },
				langs: ['typescript', 'javascript', 'json', 'bash', 'css', 'html'],
			})
			.use(rehypeExtractToc(toc))
			.use(rehypeStringify)

		const result = await processor.process(markdown)
		return { html: String(result), toc }
	}
}

async function processPage(
	page: PageNode,
	process: (md: string) => Promise<{ html: string; toc: TocEntry[] }>,
): Promise<ProcessedPage> {
	let html = ''
	let toc: TocEntry[] = []

	if (page.content) {
		const result = await process(page.content)
		html = result.html
		toc = result.toc
	}

	const children = await Promise.all(page.children.map((child) => processPage(child, process)))

	return {
		title: page.title,
		slug: page.slug,
		path: page.path,
		html,
		toc,
		order: page.order,
		children,
	}
}

function buildPageMap(
	pages: ProcessedPage[],
	map: Record<string, ProcessedPage> = {},
): Record<string, ProcessedPage> {
	for (const page of pages) {
		map[page.path] = page
		buildPageMap(page.children, map)
	}
	return map
}

export function siteDataPlugin(options: SiteDataPluginOptions = {}): Plugin {
	let siteJsonPath: string

	return {
		name: 'catforge:site-data',

		configResolved(config) {
			siteJsonPath =
				options.siteJsonPath ??
				process.env.CATFORGE_SITE_JSON ??
				resolve(config.root, '../../..', '.catforge/site.json')
		},

		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID
		},

		async load(id) {
			if (id !== RESOLVED_ID) return

			const raw = readFileSync(siteJsonPath, 'utf-8')
			const site: Site = JSON.parse(raw)
			const process = await createProcessor()

			const pages = await Promise.all(site.pages.map((page) => processPage(page, process)))
			const pageMap = buildPageMap(pages)

			const processed: ProcessedSite = {
				name: site.name,
				version: site.version,
				pages,
				api: site.api,
				pageMap,
			}

			return `export default ${JSON.stringify(processed)};`
		},

		configureServer(server) {
			// Trigger full reload when site.json changes during dev
			server.watcher.add(siteJsonPath)
			server.watcher.on('change', (path) => {
				if (path === siteJsonPath) {
					const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
					if (mod) {
						server.moduleGraph.invalidateModule(mod)
						server.ws.send({ type: 'full-reload' })
					}
				}
			})
		},
	}
}