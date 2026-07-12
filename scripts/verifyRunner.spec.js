import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("verification runner", () => {
  it("returns a nonzero status when a child command fails", () => {
    const result = spawnSync(
      process.execPath,
      [path.join("scripts", "__fixtures__", "verifyChildFailure.mjs")],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Fixture child failed with exit code 23");
  });
});
