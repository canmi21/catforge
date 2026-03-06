/* src/schema/src/config.ts */

// A single field in the config tree (supports nesting via children)
export interface ConfigField {
  // Dot-path relative to parent (e.g. "server.port")
  path: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
  children?: ConfigField[];
}

// One config document (format-agnostic)
export interface ConfigDoc {
  name: string;
  description?: string;
  // Format hint: "toml" | "yaml" | "json" | "ts" | etc.
  format: string;
  fields: ConfigField[];
}
