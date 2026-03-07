# Catforge — Project Rules

> Review and update these rules when project conventions change or no longer apply.

## Communication

- Speak Chinese with the user, keep technical terms in English (e.g. module, codegen)
- All file content (code, comments, docs, commit messages) must be concise declarative English
- No emoji

## Decision Making

- Discuss uncertain matters with the user before proceeding
- Enter plan mode when a single request contains more than 3 tasks
- When self-review reveals potential improvements (performance, design, consistency) that fall outside the current task scope, raise them with the user for discussion rather than silently deferring or silently applying

## Version Control

- Before every `git commit`, run `just fmt && just lint` and fix any errors first; also run `just test`
- For full verification (fmt + lint + build + all tests): `just verify`
- Run `git commit` after each plan mode phase completes, do not push
- Commit messages: conventional commit format (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `deps:`, `revert:`, `perf:`); scope is optional and should only be added when it genuinely clarifies context
- Never add AI co-authorship (e.g., "Co-Authored-By: Claude")

## Naming Convention

- Default: lowercase + hyphen (kebab-case) for file names, directory names, npm package names
- No uppercase-initial directory or file names unless forced by framework conventions

## Directory Structure

- `src/` uses nested layout organized by functional modules
- Nesting depth must not exceed 4 levels from `src/`
- Use directories to express module boundaries

## Comments

- Write comments, but never state the obvious
- Comments explain why, not what
- During refactoring, do not delete existing comments without first evaluating whether they remain relevant after the refactor

## Defaults vs Hard-coded Values

- Never hard-code values that users might want to customize
- Always provide a sensible default but accept user override via parameter or option

## Long-running Tasks

- Use `Bash` with `run_in_background: true` for long-running tasks (builds, full test suites)
- Do not block the main terminal; continue other work while waiting
- For persistent server processes (dev servers), use tmux: `tmux new-session -d -s <name> '<command>'`

## Running Tests

| Command       | Scope                            |
| ------------- | -------------------------------- |
| `just test`   | All tests (vitest)               |
| `just verify` | Full pipeline: fmt + lint + test |
