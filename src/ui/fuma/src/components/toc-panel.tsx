/* src/ui/fuma/src/components/toc-panel.tsx */

import { useEffect, useRef, useState } from 'react'
import type { TocEntry } from '~/lib/site-data.js'

interface TocPanelProps {
	entries: TocEntry[]
}

export function TocPanel({ entries }: TocPanelProps) {
	const [activeId, setActiveId] = useState<string>('')
	const observerRef = useRef<IntersectionObserver | null>(null)

	useEffect(() => {
		if (entries.length === 0) return

		observerRef.current = new IntersectionObserver(
			(ioEntries) => {
				for (const entry of ioEntries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
						break
					}
				}
			},
			{ rootMargin: '0px 0px -80% 0px', threshold: 0.1 },
		)

		for (const tocEntry of entries) {
			const el = document.getElementById(tocEntry.id)
			if (el) observerRef.current.observe(el)
		}

		return () => observerRef.current?.disconnect()
	}, [entries])

	if (entries.length === 0) return <aside className="site-toc" />

	return (
		<aside className="site-toc">
			<p className="toc-heading">On this page</p>
			<ul className="toc-list">
				{entries.map((entry) => (
					<li
						key={entry.id}
						className={`toc-item depth-${entry.depth}${activeId === entry.id ? ' active' : ''}`}
					>
						<a href={`#${entry.id}`}>{entry.text}</a>
					</li>
				))}
			</ul>
		</aside>
	)
}
