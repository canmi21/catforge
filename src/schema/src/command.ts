/* src/schema/src/command.ts */

export interface CommandArg {
	name: string
	type: string
	required: boolean
	default?: string
	description?: string
}

export interface CommandFlag {
	name: string
	short?: string
	type: string
	required: boolean
	default?: string
	description?: string
}

// Recursive command tree — a command may contain subcommands
export interface Command {
	name: string
	description?: string
	args: CommandArg[]
	flags: CommandFlag[]
	subcommands: Command[]
}
