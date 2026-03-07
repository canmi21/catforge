/* src/ui/fuma/src/lib/toc-context.tsx */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { TocEntry } from './site-data.js'

interface TocContextValue {
	entries: TocEntry[]
	setEntries: (entries: TocEntry[]) => void
}

const TocContext = createContext<TocContextValue>({
	entries: [],
	setEntries: () => {},
})

export function TocProvider({ children }: { children: ReactNode }) {
	const [entries, setEntries] = useState<TocEntry[]>([])
	return <TocContext value={{ entries, setEntries }}>{children}</TocContext>
}

export function useTocEntries() {
	return useContext(TocContext).entries
}

// Page components call this to push their TOC entries to the layout
export function useSetToc(entries: TocEntry[]) {
	const { setEntries } = useContext(TocContext)
	useEffect(() => {
		setEntries(entries)
		return () => setEntries([])
	}, [entries, setEntries])
}
