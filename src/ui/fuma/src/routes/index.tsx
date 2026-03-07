import { createFileRoute } from '@tanstack/react-router'
import siteData from '~/lib/site-data.js'
import { findHomePage } from '~/lib/route-utils.js'
import { MarkdownContent } from '~/components/markdown-content.js'

const home = findHomePage(siteData.pages)

export const Route = createFileRoute('/')({
	component: HomePage,
	staticData: { toc: home?.toc ?? [] },
})

function HomePage() {
	const home = findHomePage(siteData.pages)
	if (!home) return <p>No pages found.</p>
	return (
		<div>
			<h1>{home.title}</h1>
			<MarkdownContent html={home.html} />
		</div>
	)
}
