import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import stylelint from "stylelint";
import { afterEach, describe, expect, it } from "vitest";
import plugin from "./index.mjs";

const temporaryDirectories = new Set();

afterEach(() => {
  for (const directory of temporaryDirectories) {
    fs.rmSync(directory, { force: true, recursive: true });
  }

  temporaryDirectories.clear();
});

function createTheme(files) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "salt-theme-self-containment-"),
  );
  temporaryDirectories.add(directory);

  for (const [filePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(directory, filePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, contents);
  }

  return directory;
}

async function lintTheme(directory, entry, code) {
  const entryPath = path.join(directory, entry);
  const { results } = await stylelint.lint({
    code: code ?? fs.readFileSync(entryPath, "utf8"),
    codeFilename: entryPath,
    config: {
      plugins: [plugin],
      rules: {
        "salt/theme-self-containment": true,
      },
    },
  });

  return results[0].warnings;
}

describe("salt/theme-self-containment", () => {
  it("allows a self-contained theme with shared and deprecated imports", async () => {
    const directory = createTheme({
      "deprecated/aliases.css":
        ".salt-theme { --salt-alias: var(--salt-next-token); }",
      "foundations/index.css": ".salt-theme { --salt-foundation: #000000; }",
      "next/tokens.css":
        ".salt-theme-next { --salt-next-token: var(--salt-foundation); }",
      "theme-next.css": [
        '@import "foundations/index.css";',
        '@import url("next/tokens.css");',
        "@import url(deprecated/aliases.css);",
      ].join("\n"),
    });

    await expect(lintTheme(directory, "theme-next.css")).resolves.toEqual([]);
  });

  it.each([
    ["theme-next.css", "legacy"],
    ["theme.css", "next"],
  ])("rejects %s imports from %s", async (entry, disallowedDirectory) => {
    const dependency = `${disallowedDirectory}/tokens.css`;
    const directory = createTheme({
      [dependency]: ".salt-theme { --salt-token: #000000; }",
      [entry]: `@import url(${dependency});`,
    });
    const warnings = await lintTheme(directory, entry);

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      `${entry} may not depend on ${dependency}`,
    );
  });

  it.each([
    "@IMPORT url(legacy/tokens.css);",
    "@import URL(legacy/tokens.css);",
  ])("matches import syntax case-insensitively: %s", async (importRule) => {
    const directory = createTheme({
      "legacy/tokens.css": ".salt-theme { --salt-token: #000000; }",
      "theme-next.css": importRule,
    });
    const warnings = await lintTheme(directory, "theme-next.css");

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      "theme-next.css may not depend on legacy/tokens.css",
    );
  });

  it("reports custom properties missing from the dependency graph", async () => {
    const directory = createTheme({
      "next/tokens.css":
        ".salt-theme-next { --salt-next-token: var(--salt-legacy-only); }",
      "theme-next.css": "@import url(next/tokens.css);",
    });
    const warnings = await lintTheme(directory, "theme-next.css");

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      "theme-next.css references --salt-legacy-only in next/tokens.css",
    );
  });

  it("matches var functions case-insensitively", async () => {
    const directory = createTheme({
      "theme-next.css":
        ".salt-theme-next { --salt-token: VAR(--salt-missing); }",
    });
    const warnings = await lintTheme(directory, "theme-next.css");

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      "theme-next.css references --salt-missing in theme-next.css",
    );
  });

  it("analyzes in-memory entry-point content instead of the saved file", async () => {
    const directory = createTheme({
      "theme-next.css": ".salt-theme-next{--salt-defined-on-disk:#000000;}",
    });
    const warnings = await lintTheme(
      directory,
      "theme-next.css",
      ".salt-theme-next { color: var(--salt-missing); }",
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      "theme-next.css references --salt-missing in theme-next.css",
    );
  });

  it("does not treat quoted content as a custom property definition", async () => {
    const directory = createTheme({
      "next/tokens.css": [
        '.salt-theme-next::before { content: "--salt-missing:"; }',
        ".salt-theme-next { --salt-token: var(--salt-missing); }",
      ].join("\n"),
      "theme-next.css": "@import url(next/tokens.css);",
    });
    const warnings = await lintTheme(directory, "theme-next.css");

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      "theme-next.css references --salt-missing in next/tokens.css",
    );
  });

  it("does not treat quoted var syntax as a custom property reference", async () => {
    const directory = createTheme({
      "next/tokens.css":
        '.salt-theme-next::before { content: "var(--salt-missing)"; }',
      "theme-next.css": "@import url(next/tokens.css);",
    });

    await expect(lintTheme(directory, "theme-next.css")).resolves.toEqual([]);
  });

  it("reports imports that cannot be read", async () => {
    const directory = createTheme({
      "theme.css": "@import url(legacy/missing.css);",
    });
    const warnings = await lintTheme(directory, "theme.css");

    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain(
      "theme.css cannot read dependency legacy/missing.css",
    );
  });
});
