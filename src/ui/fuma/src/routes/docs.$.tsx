import { createFileRoute } from '@tanstack/react-router'
import siteData from '~/lib/site-data.js'
import { MarkdownContent } from '~/components/markdown-content.js'
import { useSetToc } from '~/lib/toc-context.js'

export const Route = createFileRoute('/docs/$')({
	component: DocPage,
})

function DocPage() {
	const { _splat } = Route.useParams()
	const page = siteData.pageMap[_splat ?? '']

	useSetToc(page?.toc ?? [])

	if (!page) {
		return (
			<div>
				<h1>Not Found</h1>
				<p>Page "{_splat}" does not exist.</p>
			</div>
		)
	}

	return (
		<div>
			<h1>{page.title}</h1>
			<MarkdownContent html={page.html} />
		</div>
	)
}
