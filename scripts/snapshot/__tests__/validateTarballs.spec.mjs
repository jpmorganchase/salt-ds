import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { checkSnapshotTarballs, checkTarball } from "../validateTarballs.mjs";
import { makeTarball, manifest, packageTarball, paxPath } from "./tarball.mjs";

const check = (tarball) => checkTarball(tarball);

describe("checkTarball", () => {
  it("accepts a snapshot of a @salt-ds package", () => {
    expect(check(packageTarball())).toEqual({
      name: "@salt-ds/core",
      version: "0.0.0-snapshot-20261002090000",
    });
  });

  it("accepts a @salt-ds package that isn't on the default branch yet", () => {
    expect(check(packageTarball({ name: "@salt-ds/cli" })).name).toBe(
      "@salt-ds/cli",
    );
  });

  it("accepts the publishConfig fields Yarn packs", () => {
    const publishConfig = {
      main: "dist-cjs/index.js",
      module: "dist-es/index.js",
      exports: { ".": { import: "./dist-es/index.js" } },
      provenance: true,
    };
    expect(check(packageTarball({ publishConfig })).name).toBe("@salt-ds/core");
  });

  it("reads directory entries, ustar prefixes and pax and GNU long names", () => {
    const tarball = makeTarball([
      { path: "package/", type: "5" },
      { path: "package.json", prefix: "package", content: manifest() },
      {
        path: "PaxHeader",
        type: "x",
        content: paxPath(`package/${"a".repeat(120)}.js`),
      },
      { path: "replaced-by-pax", content: "x" },
      {
        path: "././@LongLink",
        type: "L",
        content: `package/${"b".repeat(120)}.js`,
      },
      { path: "replaced-by-gnu", content: "y" },
    ]);
    expect(check(tarball).name).toBe("@salt-ds/core");
  });

  it.each([
    ["a release version", { version: "0.1.0-beta.99" }],
    ["a package from elsewhere", { name: "left-pad" }],
    ["a look-alike scope", { name: "@salt-ds-evil/core" }],
    ["a private package", { private: true }],
    [
      "a registry override",
      { publishConfig: { registry: "https://evil.example" } },
    ],
    ["a dist-tag override", { publishConfig: { tag: "latest" } }],
    ["a non-object publishConfig", { publishConfig: "latest" }],
    ["an install script", { scripts: { postinstall: "node steal.js" } }],
  ])("rejects %s", (_, fields) => {
    expect(() => check(packageTarball(fields))).toThrow();
  });

  it.each([
    "other/file.js",
    "package/../escape.js",
    "/package/file.js",
    "./package/file.js",
  ])("rejects the path %j", (entryPath) => {
    expect(() =>
      check(packageTarball({}, [{ path: entryPath, content: "x" }])),
    ).toThrow(/outside package\/|plain path/);
  });

  it.each([
    ["a symlink", "2"],
    ["a hard link", "1"],
  ])("rejects %s", (_, type) => {
    expect(() =>
      check(
        packageTarball({}, [
          { path: "package/link", type, linkname: "/etc/passwd" },
        ]),
      ),
    ).toThrow(/not a regular file/);
  });

  it("rejects a pax path that escapes package/", () => {
    const tarball = packageTarball({}, [
      {
        path: "PaxHeader",
        type: "x",
        content: paxPath("package/../../evil.js"),
      },
      { path: "package/innocent.js", content: "x" },
    ]);
    expect(() => check(tarball)).toThrow(/outside package\/|plain path/);
  });

  it("rejects a second manifest and a missing one", () => {
    const second = {
      path: "package/package.json",
      content: manifest({ name: "@salt-ds/lab" }),
    };
    expect(() => check(packageTarball({}, [second]))).toThrow(/more than once/);
    expect(() =>
      check(makeTarball([{ path: "package/index.js", content: "x" }])),
    ).toThrow(/missing/);
  });
});

describe("checkSnapshotTarballs", () => {
  let dir;
  const npmReadsManifest = async (file) => checkTarball(await readFile(file));
  const writeTarball = (file, fields) =>
    writeFile(path.join(dir, file), packageTarball(fields));

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "snapshot-tarballs-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns every checked tarball", async () => {
    await writeTarball("core.tgz");
    await writeTarball("lab.tgz", { name: "@salt-ds/lab" });
    const tarballs = await checkSnapshotTarballs(dir, {
      checkWithNpm: npmReadsManifest,
    });
    expect(tarballs.map((tarball) => tarball.name)).toEqual([
      "@salt-ds/core",
      "@salt-ds/lab",
    ]);
  });

  it("rejects files that are not tarballs", async () => {
    await writeTarball("core.tgz");
    await writeFile(path.join(dir, "run.sh"), "echo hi");
    await expect(
      checkSnapshotTarballs(dir, { checkWithNpm: npmReadsManifest }),
    ).rejects.toThrow(/Unexpected files/);
  });

  it("rejects two tarballs of the same package", async () => {
    await writeTarball("a.tgz");
    await writeTarball("b.tgz");
    await expect(
      checkSnapshotTarballs(dir, { checkWithNpm: npmReadsManifest }),
    ).rejects.toThrow(/more than one tarball/);
  });

  it("rejects tarballs with different snapshot versions", async () => {
    await writeTarball("core.tgz");
    await writeTarball("lab.tgz", {
      name: "@salt-ds/lab",
      version: "0.0.0-snapshot-20261002090001",
    });
    await expect(
      checkSnapshotTarballs(dir, { checkWithNpm: npmReadsManifest }),
    ).rejects.toThrow(/different versions/);
  });

  it("rejects a tarball npm reads differently", async () => {
    await writeTarball("core.tgz");
    const npmDisagrees = async () => ({
      name: "@salt-ds/core",
      version: "9.9.9",
    });
    await expect(
      checkSnapshotTarballs(dir, { checkWithNpm: npmDisagrees }),
    ).rejects.toThrow(/npm reads it as/);
  });
});
