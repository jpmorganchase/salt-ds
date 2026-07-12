import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runCommand } from "./verifyRunner.mjs";

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

  it("merges task-specific environment variables into the child", async () => {
    await expect(
      runCommand({
        label: "Environment fixture",
        command: process.execPath,
        args: [
          "-e",
          'process.exit(process.env.VERIFY_FIXTURE === "set" ? 0 : 2)',
        ],
        env: { VERIFY_FIXTURE: "set" },
      }),
    ).resolves.toBeUndefined();
  });
});
