// Renders pre-processed HTML from the unified markdown pipeline.
// Content is trusted: it originates from the project's own markdown files,
// processed at build time by vite-plugin-site-data.
export function MarkdownContent({ html }: { html: string }) {
	return (
		<div
			className="markdown-body"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
