import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  isPortableArchivePath,
  resolvePackageArchiveEntry,
  resolvePackageRelativeArchivePath,
} from "../../../../scripts/packageArchivePath.mjs";

describe("package archive path containment", () => {
  const extractionRoot = path.join(os.tmpdir(), "salt-package-archive-test");
  const packageRoot = path.join(extractionRoot, "package");

  it("resolves canonical files and directory entries under the package root", () => {
    expect(
      resolvePackageArchiveEntry(extractionRoot, "package/"),
    ).toMatchObject({
      directory: true,
      entry: "package",
      destination: packageRoot,
    });
    expect(
      resolvePackageArchiveEntry(extractionRoot, "package/dist-es/index.js"),
    ).toMatchObject({
      directory: false,
      entry: "package/dist-es/index.js",
      destination: path.join(packageRoot, "dist-es", "index.js"),
    });
    expect(
      resolvePackageArchiveEntry(extractionRoot, "package/generated/"),
    ).toMatchObject({
      directory: true,
      entry: "package/generated",
    });
  });

  it.each([
    "../outside",
    "package/../outside",
    "package/a/../../outside",
    "package/./index.js",
    "package//index.js",
    "package/generated//",
    "package\\..\\outside",
    "package\\generated/index.js",
    "/package/index.js",
    "C:/package/index.js",
    "//server/share/package/index.js",
    "other/index.js",
    "package/CON",
    "package/name.",
    "package/name ",
    "package/control\u0000name",
    "package/cafe\u0301",
  ])("rejects unsafe raw archive entry %j", (entry) => {
    expect(() => resolvePackageArchiveEntry(extractionRoot, entry)).toThrow();
  });

  it("validates npm pack metadata without normalizing hostile separators", () => {
    expect(
      resolvePackageRelativeArchivePath(packageRoot, "dist-cjs/index.js"),
    ).toEqual({
      path: "dist-cjs/index.js",
      destination: path.join(packageRoot, "dist-cjs", "index.js"),
    });
    for (const unsafe of [
      "../outside",
      "dist-es/../outside",
      "dist-es\\index.js",
      "dist-es//index.js",
      "/dist-es/index.js",
      "C:/dist-es/index.js",
    ]) {
      expect(() =>
        resolvePackageRelativeArchivePath(packageRoot, unsafe),
      ).toThrow();
    }
  });

  it("accepts only canonical portable path segments", () => {
    expect(isPortableArchivePath("generated/catalog-manifest.json")).toBe(true);
    expect(isPortableArchivePath("generated/../catalog-manifest.json")).toBe(
      false,
    );
    expect(isPortableArchivePath("generated\\catalog-manifest.json")).toBe(
      false,
    );
  });

  it("uses the complete shared portable-path corpus", () => {
    const corpus = JSON.parse(
      fs.readFileSync(
        path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "../../../../scripts/fixtures/catalogPortablePath.cases.json",
        ),
        "utf8",
      ),
    ) as { accepted: string[]; rejected: string[] };

    for (const candidate of corpus.accepted) {
      expect(isPortableArchivePath(candidate), candidate).toBe(true);
    }
    for (const candidate of corpus.rejected) {
      expect(isPortableArchivePath(candidate), candidate).toBe(false);
    }
  });
});
