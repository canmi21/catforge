/* src/schema/src/site.ts */

import type { BaseSymbol, Module } from "./base.js";

export interface PageNode {
  title: string;
  slug: string;
  // Full route path: "guides/installation"
  path: string;
  // Raw markdown (undefined for directory-only section nodes)
  content?: string;
  // Sort weight: lower values first, default Infinity
  order: number;
  children: PageNode[];
}

export interface ApiSection<S extends BaseSymbol = BaseSymbol> {
  packageName: string;
  language: string;
  modules: Module<S>[];
}

export interface Site<S extends BaseSymbol = BaseSymbol> {
  name: string;
  version?: string;
  generatedAt: string;
  pages: PageNode[];
  api: ApiSection<S>[];
}
