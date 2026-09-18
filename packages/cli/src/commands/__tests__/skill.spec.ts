import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runSkillCommand } from "../skill.js";

const temporaryDirectories: string[] = [];
const generatedBundle = path.resolve(
  import.meta.dirname,
  "../../../../knowledge/generated",
);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("skill command", () => {
  it("reports custom provenance and prints the exact selected bytes", async () => {
    const info = JSON.parse(
      await runSkillCommand({
        action: "info",
        bundleDir: generatedBundle,
      }),
    );
    expect(info.contract).toBe("salt-cli-skill-info/1");
    expect(info.artifacts.map((entry: { kind: string }) => entry.kind)).toEqual([
      "skill",
      "agents",
    ]);
    expect(
      info.artifacts.every(
        (entry: { provenance: string; package_relative_path: string }) =>
          entry.provenance === "custom" &&
          !path.isAbsolute(entry.package_relative_path),
      ),
    ).toBe(true);

    const skill = await runSkillCommand({
      action: "print",
      kind: "skill",
      bundleDir: generatedBundle,
    });
    expect(skill).toBe(
      await fs.readFile(
        path.join(generatedBundle, "skills/salt-design-system/SKILL.md"),
        "utf8",
      ),
    );
  });

  it("rejects edited artifact bytes and fake managed markers", async () => {
    const copy = await fs.mkdtemp(path.join(os.tmpdir(), "salt-skill-test-"));
    temporaryDirectories.push(copy);
    await fs.cp(generatedBundle, copy, { recursive: true });
    await fs.appendFile(
      path.join(copy, "skills/salt-design-system/SKILL.md"),
      "\n<!-- fake managed marker -->\n",
    );
    await expect(
      runSkillCommand({ action: "print", kind: "skill", bundleDir: copy }),
    ).rejects.toThrow(/digest.*mismatch/u);
  });
});
