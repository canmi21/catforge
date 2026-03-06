/* src/schema/src/typescript.ts */

import type { BaseSymbol } from "./base.js";

// Shared sub-structures

export interface TsParam {
  name: string;
  type: string;
  optional: boolean;
  default?: string;
}

export interface TsEnumMember {
  name: string;
  value?: string;
}

// TS symbol kinds — each narrows `kind` to a string literal

export interface TsFunction extends BaseSymbol {
  kind: "function";
  params: TsParam[];
  returnType: string;
  typeParams?: string[];
  async?: boolean;
}

export interface TsInterface extends BaseSymbol {
  kind: "interface";
  typeParams?: string[];
  extends?: string[];
}

export interface TsClass extends BaseSymbol {
  kind: "class";
  typeParams?: string[];
  extends?: string;
  implements?: string[];
}

export interface TsTypeAlias extends BaseSymbol {
  kind: "type";
  typeParams?: string[];
}

export interface TsEnum extends BaseSymbol {
  kind: "enum";
  members: TsEnumMember[];
}

// Union of all TS-specific symbol kinds
export type TsSymbol =
  | TsFunction
  | TsInterface
  | TsClass
  | TsTypeAlias
  | TsEnum;
