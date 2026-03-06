// Public API for the TypeScript adapter.

import type { DocOutput, TsSymbol } from "@catforge/schema";
import { readFile } from "node:fs/promises";
import { convertTypedoc } from "./convert.js";

export type { ConvertOptions } from "./convert.js";
export { convertTypedoc } from "./convert.js";

export async function convertTypedocFile(
  path: string,
  options?: { projectVersion?: string; schemaVersion?: string },
): Promise<DocOutput<TsSymbol>> {
  const content = await readFile(path, "utf-8");
  const json: unknown = JSON.parse(content);
  return convertTypedoc(json, options);
}
