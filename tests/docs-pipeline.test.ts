import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Site } from '../src/schema/src/index.js'
import { buildSite } from '../src/docs/src/pipeline.js'
import { parseFrontmatter, scanMarkdown, titleFromFilename } from '../src/docs/src/markdown.js'
import type { CatforgeConfig } from '../src/docs/src/config.js'

const rootDir = resolve(__dirname, '..')

const config: CatforgeConfig = {
	name: 'Catforge',
	packages: [
		{
			name: '@catforge/schema',
			adapter: 'typescript',
			source: resolve(rootDir, 'tests/fixtures/schema.typedoc.json'),
		},
	],
	docsDir: 'examples/docs',
	versionFrom: 'package.json',
}

describe('parseFrontmatter', () => {
	it('extracts frontmatter and content', () => {
		const raw = '---\ntitle: Hello\norder: 1\n---\nBody text.'
		const { frontmatter, content } = parseFrontmatter(raw)
		expect(frontmatter.title).toBe('Hello')
		expect(frontmatter.order).toBe(1)
		expect(content).toBe('Body text.')
	})

	it('returns raw content when no frontmatter', () => {
		const raw = 'Just plain markdown.'
		const { frontmatter, content } = parseFrontmatter(raw)
		expect(frontmatter).toEqual({})
		expect(content).toBe(raw)
	})

	it('handles unclosed frontmatter fence', () => {
		const raw = '---\ntitle: Broken'
		const { content } = parseFrontmatter(raw)
		expect(content).toBe(raw)
	})

	it('degrades gracefully on malformed YAML', () => {
		const raw = '---\n: [invalid\n---\nBody text.'
		const { frontmatter, content } = parseFrontmatter(raw)
		// Malformed YAML falls back to empty frontmatter with raw content
		expect(frontmatter).toEqual({})
		expect(content).toBe(raw)
	})
})

describe('titleFromFilename', () => {
	it('converts kebab-case to title case', () => {
		expect(titleFromFilename('getting-started.md')).toBe('Getting Started')
	})

	it('handles single word', () => {
		expect(titleFromFilename('index.md')).toBe('Index')
	})
})

describe('scanMarkdown', () => {
	it('returns empty array for nonexistent directory', async () => {
		const pages = await scanMarkdown('/nonexistent/dir')
		expect(pages).toEqual([])
	})
})

describe('buildSite', () => {
	let site: Site

	// Build once for all assertions
	it('builds without error', async () => {
		site = await buildSite(config, { rootDir })
	})

	it('propagates config name', () => {
		expect(site.name).toBe('Catforge')
	})

	it('reads version from package.json', () => {
		expect(site.version).toBeDefined()
	})

	it('sets generatedAt as ISO 8601', () => {
		expect(site.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})

	it('has correct top-level page structure', () => {
		// index.md (root-level, not in a subdir) is a normal page
		// getting-started.md is a normal page
		// guides/ is a section node
		expect(site.pages.length).toBe(3)
		const titles = site.pages.map((p) => p.title)
		expect(titles).toContain('Home')
		expect(titles).toContain('Getting Started')
		expect(titles).toContain('Guides')
	})

	it('sorts pages by order', () => {
		// Home (order 0), Getting Started (order 1), Guides (order Infinity)
		expect(site.pages[0].title).toBe('Home')
		expect(site.pages[1].title).toBe('Getting Started')
	})

	it('builds guides section with children', () => {
		const guides = site.pages.find((p) => p.slug === 'guides')
		expect(guides).toBeDefined()
		expect(guides!.children.length).toBe(1)
		expect(guides!.children[0].title).toBe('Installation')
		expect(guides!.children[0].path).toBe('guides/installation')
	})

	it('strips frontmatter from page content', () => {
		const home = site.pages.find((p) => p.slug === 'index')
		expect(home).toBeDefined()
		expect(home!.content).not.toContain('---')
		expect(home!.content).toContain('Welcome to Catforge')
	})

	it('uses frontmatter title over filename', () => {
		const home = site.pages.find((p) => p.slug === 'index')
		expect(home!.title).toBe('Home')
	})

	it('produces API sections from adapter', () => {
		expect(site.api.length).toBe(1)
	})

	it('has correct module count from schema fixture', () => {
		// base, command, config, output, typescript
		expect(site.api[0].modules.length).toBe(5)
	})

	it('sets API packageName', () => {
		expect(site.api[0].packageName).toBe('@catforge/schema')
	})
})
