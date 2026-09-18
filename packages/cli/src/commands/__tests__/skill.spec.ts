import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runSkillCommand } from "../skill.js";

vi.mock("@salt-ds/knowledge", async () => {
  const actual =
    await vi.importActual<typeof import("@salt-ds/knowledge")>(
      "@salt-ds/knowledge",
    );
  return {
    ...actual,
    loadKnowledgeRuntimeContext: (
      options: Parameters<typeof actual.loadKnowledgeRuntimeContext>[0] = {},
    ) =>
      actual.loadKnowledgeRuntimeContext(
        options.bundleDir
          ? options
          : { bundleDir: `${process.cwd()}/packages/knowledge/generated` },
      ),
  };
});

const temporaryDirectories: string[] = [];
const generatedBundle = path.resolve(
  import.meta.dirname,
  "../../../../knowledge/generated",
);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("skill command", () => {
  it("separates bundle selection, integrity, and origin authentication", async () => {
    const installedInfo = JSON.parse(
      await runSkillCommand({
        action: "info",
      }),
    );
    const customInfo = JSON.parse(
      await runSkillCommand({
        action: "info",
        bundleDir: generatedBundle,
      }),
    );
    expect(customInfo.contract).toBe("salt-cli-skill-info/1");
    expect(
      customInfo.artifacts.map((entry: { kind: string }) => entry.kind),
    ).toEqual(["skill", "agents"]);
    for (const [info, bundleSource] of [
      [installedInfo, "installed_package"],
      [customInfo, "custom_directory"],
    ] as const) {
      expect(
        info.artifacts.every(
          (entry: {
            bundle_source: string;
            integrity: string;
            origin_authentication: string;
            package_relative_path: string;
          }) =>
            entry.bundle_source === bundleSource &&
            entry.integrity === "manifest_verified" &&
            entry.origin_authentication === "not_established_by_bundle" &&
            !path.isAbsolute(entry.package_relative_path),
        ),
      ).toBe(true);
      expect(JSON.stringify(info)).not.toMatch(
        /official|immutable_url|provenance/u,
      );
    }

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
