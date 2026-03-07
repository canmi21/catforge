import { readFile, readdir, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { PageNode } from '@catforge/schema'

export interface Frontmatter {
	title?: string
	order?: number
	[key: string]: unknown
}

export interface ParsedMarkdown {
	frontmatter: Frontmatter
	content: string
}

// Split on `---` fences, parse YAML block
export function parseFrontmatter(raw: string): ParsedMarkdown {
	if (!raw.startsWith('---')) {
		return { frontmatter: {}, content: raw }
	}

	const end = raw.indexOf('\n---', 3)
	if (end === -1) {
		return { frontmatter: {}, content: raw }
	}

	const yamlBlock = raw.slice(4, end)
	const content = raw.slice(end + 4).replace(/^\n/, '')

	let frontmatter: Frontmatter
	try {
		frontmatter = parseYaml(yamlBlock) ?? {}
	} catch {
		// Malformed YAML — treat as no frontmatter and keep the raw content
		return { frontmatter: {}, content: raw }
	}

	return { frontmatter, content }
}

// "getting-started.md" -> "Getting Started"
export function titleFromFilename(name: string): string {
	const stem = basename(name, extname(name))
	return stem
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ')
}

// Recursively scan a directory into a PageNode tree
export async function scanMarkdown(dir: string, parentPath = ''): Promise<PageNode[]> {
	let entries: string[]
	try {
		entries = await readdir(dir)
	} catch {
		return []
	}

	const pages: PageNode[] = []

	// Separate files and dirs
	const files: string[] = []
	const dirs: string[] = []
	for (const entry of entries) {
		const fullPath = join(dir, entry)
		const s = await stat(fullPath)
		if (s.isDirectory()) {
			dirs.push(entry)
		} else if (entry.endsWith('.md')) {
			files.push(entry)
		}
	}

	// Process markdown files.
	// Skip index.md in subdirectories — it gets promoted as directory content.
	// At root level (parentPath empty), index.md is a normal page.
	for (const file of files) {
		if (file === 'index.md' && parentPath !== '') continue
		const raw = await readFile(join(dir, file), 'utf-8')
		const { frontmatter, content } = parseFrontmatter(raw)
		const slug = basename(file, '.md')
		const path = parentPath ? `${parentPath}/${slug}` : slug

		pages.push({
			title: frontmatter.title ?? titleFromFilename(file),
			slug,
			path,
			content,
			order: frontmatter.order ?? Infinity,
			children: [],
		})
	}

	// Process subdirectories
	for (const dirName of dirs) {
		const dirPath = join(dir, dirName)
		const slug = dirName
		const path = parentPath ? `${parentPath}/${slug}` : slug

		// Check for index.md to promote as directory content
		let content: string | undefined
		let title = titleFromFilename(dirName)
		let order: number = Infinity
		try {
			const raw = await readFile(join(dirPath, 'index.md'), 'utf-8')
			const parsed = parseFrontmatter(raw)
			content = parsed.content
			if (parsed.frontmatter.title) title = parsed.frontmatter.title
			if (parsed.frontmatter.order !== undefined) order = parsed.frontmatter.order
		} catch {
			// No index.md — directory-only section node
		}

		const children = await scanMarkdown(dirPath, path)

		pages.push({
			title,
			slug,
			path,
			content,
			order,
			children,
		})
	}

	// Sort: by order ascending, then title alphabetically
	pages.sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order
		return a.title.localeCompare(b.title)
	})

	return pages
}
