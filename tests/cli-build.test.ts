import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Site } from "../src/schema/src/index.js";
import { loadConfig, runBuild } from "../src/cli/src/build.js";

const rootDir = resolve(__dirname, "..");
const outDir = resolve(rootDir, ".catforge");

describe("loadConfig", () => {
  it("loads catforge.config.ts", async () => {
    const config = await loadConfig(rootDir);
    expect(config.name).toBe("Catforge");
    expect(config.packages).toHaveLength(1);
    expect(config.packages[0].adapter).toBe("typescript");
  });
});

describe("runBuild", () => {
  beforeAll(async () => {
    await rm(outDir, { recursive: true, force: true });
    // Suppress console output during test
    const originalLog = console.log;
    console.log = () => {};
    await runBuild(rootDir);
    console.log = originalLog;
  });

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it("creates site.json in output directory", async () => {
    const content = await readFile(resolve(outDir, "site.json"), "utf-8");
    expect(content).toBeTruthy();
  });

  it("produces valid Site structure", async () => {
    const content = await readFile(resolve(outDir, "site.json"), "utf-8");
    const site: Site = JSON.parse(content);

    expect(site.name).toBe("Catforge");
    expect(site.version).toBeDefined();
    expect(site.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(site.pages.length).toBeGreaterThan(0);
    expect(site.api.length).toBe(1);
  });

  it("includes API symbols", async () => {
    const content = await readFile(resolve(outDir, "site.json"), "utf-8");
    const site: Site = JSON.parse(content);
    const symbolCount = site.api.reduce(
      (sum, section) =>
        sum + section.modules.reduce((m, mod) => m + mod.symbols.length, 0),
      0,
    );
    expect(symbolCount).toBeGreaterThan(0);
  });
});
