import { describe, expect, it } from "vitest";
import {
  isGitIgnored,
  matchesPortableGlob,
  matchesWorkspacePatterns,
  parseGitIgnore,
} from "../pathPatterns.js";

describe("portable discovery patterns", () => {
  it("matches portable star and globstar forms", () => {
    expect(matchesPortableGlob("src/a.ts", "src/**/*.ts")).toBe(true);
    expect(matchesPortableGlob("src/nested/a.ts", "src/**/*.ts")).toBe(true);
    expect(matchesPortableGlob("src/nested/a.css", "src/**/*.ts")).toBe(false);
    expect(matchesPortableGlob("packages/app", "packages/*")).toBe(true);
    expect(matchesPortableGlob("packages/group/app", "packages/*")).toBe(false);
  });

  it("applies gitignore rules in order with CRLF normalization", () => {
    const rules = parseGitIgnore("*.ts\r\n!important.ts\r\n/build/\r\n", ".");
    expect(isGitIgnored("src/a.ts", false, rules)).toBe(true);
    expect(isGitIgnored("src/important.ts", false, rules)).toBe(false);
    expect(isGitIgnored("build", true, rules)).toBe(true);
  });

  it("applies ordered positive and negative workspace patterns", () => {
    expect(matchesWorkspacePatterns("packages/app", ["packages/*"])).toBe(true);
    expect(
      matchesWorkspacePatterns("packages/app", ["{packages,apps}/*"]),
    ).toBe(true);
    expect(
      matchesWorkspacePatterns("packages/private", [
        "packages/*",
        "!packages/private",
      ]),
    ).toBe(false);
  });
});
