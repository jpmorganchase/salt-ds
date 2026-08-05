import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectRuntimeReachableFiles } from "../../scripts/measureRuntimeReachableLoc.mjs";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

async function createSourceTree(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-runtime-loc-"));
  tempDirs.push(root);
  return root;
}

describe("runtime LOC measurement integrity", () => {
  it("fails when production runtime imports a path excluded from measurement", async () => {
    const sourceRoot = await createSourceTree();
    const entryPoint = path.join(sourceRoot, "index.ts");
    const excludedFile = path.join(sourceRoot, "core", "build", "hidden.ts");
    await fs.mkdir(path.dirname(excludedFile), { recursive: true });
    await Promise.all([
      fs.writeFile(
        entryPoint,
        'export { hidden } from "./core/build/hidden.js";\n',
      ),
      fs.writeFile(excludedFile, "export const hidden = true;\n"),
    ]);

    expect(() =>
      collectRuntimeReachableFiles(sourceRoot, [entryPoint]),
    ).toThrow(/runtime-reachable source is excluded/iu);
  });

  it("counts ordinary runtime dependencies", async () => {
    const sourceRoot = await createSourceTree();
    const entryPoint = path.join(sourceRoot, "index.ts");
    const dependency = path.join(sourceRoot, "runtime.ts");
    await Promise.all([
      fs.writeFile(entryPoint, 'export { active } from "./runtime.js";\n'),
      fs.writeFile(dependency, "export const active = true;\n"),
    ]);

    expect(collectRuntimeReachableFiles(sourceRoot, [entryPoint])).toEqual(
      [entryPoint, dependency].sort(),
    );
  });
});
