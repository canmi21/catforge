# Catforge — unified task runner
# Usage: just <recipe>   |   just --list

set dotenv-load := true
set shell := ["bash", "-euo", "pipefail", "-c"]

# Package manager
pm := "bun"

# List all recipes
default:
    @just --list

# Format + lint (pre-commit gate)
pre-commit: fmt lint

# Run all formatters
fmt: fmt-ts fmt-md
    chore .

# Format TS (oxfmt)
fmt-ts:
    {{pm}} run fmt:ts

# Format markdown (dprint)
fmt-md:
    {{pm}} run fmt:md

# Normalize file paths (chore)
fmt-path:
    chore .

# Check formatting without writing
fmt-check:
    {{pm}} run fmt:ts:check
    {{pm}} run fmt:md:check

# Run all linters
lint: lint-ts

# Lint TS (oxlint + eslint)
lint-ts:
    {{pm}} run lint:ox
    {{pm}} run lint:eslint

# Lint TS — oxlint only (no build artifacts needed)
lint-ox:
    {{pm}} run lint:ox

# Auto-fix lint issues
lint-fix:
    {{pm}} run lint:ox:fix
    {{pm}} run lint:eslint:fix

# Check unlisted dependencies (knip)
lint-deps:
    {{pm}} run lint:deps

# Build TS
build:
    {{pm}} run build

# Run tests (vitest)
test:
    {{pm}} run test

# TypeScript type checking
typecheck:
    {{pm}}x tsc --noEmit

# Full verification pipeline
verify: fmt lint test

# Install dependencies
inst:
    {{pm}} install

# Remove build artifacts and dependencies
clean: clean-ts clean-deps

# Remove TS build output (dist/)
clean-ts:
    find . -type d -name dist -not -path '*/node_modules/*' -not -path '*/.git/*' -exec rm -rf {} +

# Remove all node_modules
clean-deps:
    find . -type d -name node_modules -not -path '*/node_modules/*' -exec rm -rf {} +

# Lines of code statistics
sloc:
    tokei
