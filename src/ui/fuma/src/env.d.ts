declare module 'virtual:site-data' {
	import type { ProcessedSite } from './lib/site-data.js'
	const data: ProcessedSite
	export default data
}
