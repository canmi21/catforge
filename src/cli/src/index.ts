#!/usr/bin/env node

import { runBuild } from "./build.js";

const args = process.argv.slice(2);
const command = args[0];

if (command === "--help" || command === "-h" || args.length === 0) {
  console.log(`catforge - documentation site generator

Usage:
  catforge build    Build the documentation site
  catforge --help   Show this help message`);
  process.exit(0);
}

if (command === "--version" || command === "-v") {
  console.log("0.0.1");
  process.exit(0);
}

if (command === "build") {
  runBuild(process.cwd()).catch((err: Error) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command}\nRun "catforge --help" for usage.`);
  process.exit(1);
}
