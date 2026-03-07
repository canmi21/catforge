#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runBuild } from './build.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg: { version: string } = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

const args = process.argv.slice(2)
const command = args[0]

if (command === '--help' || command === '-h' || args.length === 0) {
	console.log(`catforge v${pkg.version} - documentation site generator

Usage:
  catforge build    Build the documentation site
  catforge --help   Show this help message`)
	process.exit(0)
}

if (command === '--version' || command === '-v') {
	console.log(pkg.version)
	process.exit(0)
}

if (command === 'build') {
	runBuild(process.cwd()).catch((err: Error) => {
		console.error(`Error: ${err.message}`)
		process.exit(1)
	})
} else {
	console.error(`Unknown command: ${command}\nRun "catforge --help" for usage.`)
	process.exit(1)
}
