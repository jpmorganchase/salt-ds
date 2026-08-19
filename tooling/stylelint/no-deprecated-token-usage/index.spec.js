import path from "node:path";
import stylelint from "stylelint";
import { describe, expect, it } from "vitest";
import plugin from "./index.mjs";

const deprecatedTokens = {
  legacy: "--salt-accent-foreground-disabled",
  next: "--salt-palette-warning-action-active",
  shared: "--salt-size-stackable",
};
const activeSharedToken = "--salt-color-white-15a";

async function lintTokens(sourcePath, tokens) {
  const code = tokens
    .map((token, index) => `.test-${index} { color: var(${token}); }`)
    .join("\n");
  const { results } = await stylelint.lint({
    code,
    codeFilename: path.join(process.cwd(), sourcePath),
    config: {
      plugins: [plugin],
      rules: {
        "salt/no-deprecated-token-usage": { logLevel: "default" },
      },
    },
  });

  return results[0].warnings;
}

describe("salt/no-deprecated-token-usage", () => {
  it("checks legacy theme CSS against shared and legacy deprecations", async () => {
    const warnings = await lintTokens(
      "packages/theme/css/legacy/characteristics/test.css",
      Object.values(deprecatedTokens),
    );

    expect(warnings.map(({ text }) => text)).toEqual([
      expect.stringContaining(deprecatedTokens.legacy),
      expect.stringContaining(deprecatedTokens.shared),
    ]);
  });

  it("checks next theme CSS against shared and next deprecations", async () => {
    const warnings = await lintTokens(
      "packages/theme/css/next/characteristics/test.css",
      Object.values(deprecatedTokens),
    );

    expect(warnings.map(({ text }) => text)).toEqual([
      expect.stringContaining(deprecatedTokens.next),
      expect.stringContaining(deprecatedTokens.shared),
    ]);
  });

  it("checks non-theme CSS against all deprecations", async () => {
    const warnings = await lintTokens(
      "packages/core/src/test/Test.css",
      Object.values(deprecatedTokens),
    );

    expect(warnings.map(({ text }) => text)).toEqual(
      Object.values(deprecatedTokens).map((token) =>
        expect.stringContaining(token),
      ),
    );
  });

  it("does not flag shared deprecated declarations that remain active", async () => {
    const warnings = await lintTokens("packages/core/src/test/Test.css", [
      activeSharedToken,
    ]);

    expect(warnings).toEqual([]);
  });
});
