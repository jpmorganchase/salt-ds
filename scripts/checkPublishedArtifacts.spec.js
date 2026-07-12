import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { validatePublishedPackage } from "./checkPublishedArtifacts.mjs";

const temporaryDirectories = [];

function createPackage({
  name = "@salt-ds/example",
  files = ["dist-cjs", "dist-es", "dist-types"],
  dependencies = {},
} = {}) {
  const outputDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "salt-artifact-test-"),
  );
  temporaryDirectories.push(outputDirectory);
  for (const directory of ["dist-cjs", "dist-es", "dist-types"]) {
    fs.mkdirSync(path.join(outputDirectory, directory), { recursive: true });
  }
  fs.writeFileSync(path.join(outputDirectory, "dist-cjs/index.js"), "");
  fs.writeFileSync(path.join(outputDirectory, "dist-es/index.js"), "");
  fs.writeFileSync(path.join(outputDirectory, "dist-types/index.d.ts"), "");
  fs.writeFileSync(
    path.join(outputDirectory, "package.json"),
    JSON.stringify({
      name,
      main: "dist-cjs/index.js",
      module: "dist-es/index.js",
      typings: "dist-types/index.d.ts",
      files,
      dependencies,
    }),
  );
  return { outputDirectory, manifest: { name } };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});

describe("published artifact validation", () => {
  it("accepts a complete built manifest", () => {
    expect(validatePublishedPackage(createPackage())).toEqual([]);
  });

  it.each([
    "dist-cjs/index.js",
    "dist-es/index.js",
    "dist-types/index.d.ts",
  ])("reports a missing entry artifact: %s", (entry) => {
    const packageInfo = createPackage();
    fs.rmSync(path.join(packageInfo.outputDirectory, entry));
    expect(validatePublishedPackage(packageInfo)).toHaveLength(1);
  });

  it("reports unresolved workspace ranges", () => {
    const packageInfo = createPackage({
      dependencies: { "@salt-ds/core": "workspace:^" },
    });
    expect(validatePublishedPackage(packageInfo)[0]).toContain("workspace:^");
  });

  it("reports required package CSS", () => {
    const packageInfo = createPackage({ name: "@salt-ds/icons" });
    expect(validatePublishedPackage(packageInfo)[0]).toContain(
      "css/salt-icon.css",
    );
  });
});
