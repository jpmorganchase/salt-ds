import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  loadBoundedTsconfigAliases,
  MAX_TSCONFIG_EXTENDS_ENTRIES,
  MAX_TSCONFIG_FILES,
  MAX_TSCONFIG_UTF8_BYTES,
} from "../projectContext/boundedTsconfig.js";

const tempDirs: string[] = [];

async function tempDir(label: string): Promise<string> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), `${label}-`));
  tempDirs.push(directory);
  return directory;
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value), "utf8");
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("bounded tsconfig alias loading", () => {
  it("reports an absent root config without searching ancestors", async () => {
    const parent = await tempDir("salt-tsconfig-absent");
    const root = path.join(parent, "child");
    await fs.mkdir(root);
    await writeJson(path.join(parent, "tsconfig.json"), {
      compilerOptions: { paths: { "@outside/*": ["outside/*"] } },
    });
    const result = await loadBoundedTsconfigAliases(root);

    expect(result).toMatchObject({
      filesRead: 0,
      filesAttempted: 1,
      aliasPatterns: [],
      limitations: ["tsconfig_unavailable"],
    });
  });

  it("loads contained relative extends and rejects an escaping extends", async () => {
    const root = await tempDir("salt-tsconfig-extends");
    await writeJson(path.join(root, "base.json"), {
      compilerOptions: {
        baseUrl: ".",
        paths: { "@app/*": ["src/*"] },
      },
    });
    await writeJson(path.join(root, "tsconfig.json"), {
      extends: ["./base.json", "../outside-tsconfig.json"],
    });

    const result = await loadBoundedTsconfigAliases(root);
    expect(result.filesRead).toBe(2);
    expect(result.aliasPatterns).toEqual(["@app/*"]);
    expect(result.pathsMatcher).toBeNull();
    expect(result.limitations).toContain("tsconfig_invalid");
  });

  it("enforces byte caps for root and inherited configs", async () => {
    const root = await tempDir("salt-tsconfig-size");
    await fs.writeFile(
      path.join(root, "tsconfig.json"),
      " ".repeat(MAX_TSCONFIG_UTF8_BYTES + 1),
      "utf8",
    );
    expect((await loadBoundedTsconfigAliases(root)).limitations).toContain(
      "tsconfig_invalid",
    );

    await writeJson(path.join(root, "tsconfig.json"), { extends: "./base" });
    await fs.writeFile(
      path.join(root, "base.json"),
      " ".repeat(MAX_TSCONFIG_UTF8_BYTES + 1),
      "utf8",
    );
    const inherited = await loadBoundedTsconfigAliases(root);
    expect(inherited.filesRead).toBe(1);
    expect(inherited.limitations).toContain("tsconfig_invalid");
  });

  it("bounds extends breadth, cycles, depth, and valid file count", async () => {
    const root = await tempDir("salt-tsconfig-bounds");
    await writeJson(path.join(root, "tsconfig.json"), {
      extends: Array.from(
        { length: MAX_TSCONFIG_EXTENDS_ENTRIES + 1 },
        (_, index) => `./missing-${index}.json`,
      ),
    });
    const breadth = await loadBoundedTsconfigAliases(root);
    expect(breadth.filesAttempted).toBe(MAX_TSCONFIG_EXTENDS_ENTRIES + 1);
    expect(breadth.limitations).toContain("tsconfig_attempt_limit");

    for (let index = 0; index <= 9; index += 1) {
      await writeJson(
        path.join(root, index === 0 ? "tsconfig.json" : `chain-${index}.json`),
        index < 9
          ? { extends: `./chain-${index + 1}.json` }
          : { compilerOptions: {} },
      );
    }
    const depth = await loadBoundedTsconfigAliases(root);
    expect(depth.filesRead).toBe(9);
    expect(depth.limitations).toContain("tsconfig_depth_limit");

    await writeJson(path.join(root, "tsconfig.json"), {
      extends: Array.from(
        { length: MAX_TSCONFIG_FILES },
        (_, index) => `./file-${index}.json`,
      ),
    });
    await Promise.all(
      Array.from({ length: MAX_TSCONFIG_FILES }, (_, index) =>
        writeJson(path.join(root, `file-${index}.json`), {
          compilerOptions: {},
        }),
      ),
    );
    const files = await loadBoundedTsconfigAliases(root);
    expect(files.filesRead).toBe(MAX_TSCONFIG_FILES);
    expect(files.limitations).toContain("tsconfig_file_limit");

    await writeJson(path.join(root, "tsconfig.json"), {
      extends: "./cycle.json",
    });
    await writeJson(path.join(root, "cycle.json"), {
      extends: "./tsconfig.json",
    });
    const cycle = await loadBoundedTsconfigAliases(root);
    expect(cycle.filesRead).toBe(2);
    expect(cycle.filesAttempted).toBe(2);
    expect(cycle.limitations).toContain("tsconfig_invalid");
    expect(cycle.pathsMatcher).toBeNull();
  });

  it("rejects canonical self-cycles reached through a lexical alias", async () => {
    const root = await tempDir("salt-tsconfig-canonical-cycle");
    const configPath = path.join(root, "tsconfig.json");
    const aliasPath = path.join(root, "tsconfig-alias.json");
    await writeJson(configPath, {
      extends:
        process.platform === "win32"
          ? "./TSCONFIG.json"
          : "./tsconfig-alias.json",
      compilerOptions: {
        paths: { "@app/*": ["src/*"] },
      },
    });
    if (process.platform !== "win32") {
      await fs.symlink(configPath, aliasPath, "file");
    }

    const result = await loadBoundedTsconfigAliases(root);
    expect(result.limitations).toContain("tsconfig_invalid");
    expect(result.pathsMatcher).toBeNull();
  });

  it("caps alias expansion candidates", async () => {
    const root = await tempDir("salt-tsconfig-alias-cap");
    await writeJson(path.join(root, "tsconfig.json"), {
      compilerOptions: {
        paths: Object.fromEntries(
          Array.from({ length: 128 }, (_, index) => [
            `@app/${"B".repeat(index)}*`,
            Array.from({ length: 16 }, (__, target) => `src/${target}/*`),
          ]),
        ),
      },
    });
    const result = await loadBoundedTsconfigAliases(root);
    expect(result.pathsMatcher?.(`@app/${"B".repeat(127)}Button`).length).toBe(
      16,
    );
  });

  it("selects the exact or longest-prefix alias only", async () => {
    const root = await tempDir("salt-tsconfig-alias-selection");
    await writeJson(path.join(root, "tsconfig.json"), {
      compilerOptions: {
        paths: {
          "@app/Button": ["src/exact.ts"],
          "@app/*": ["src/general/*"],
          "@app/components/*": ["src/components/*"],
        },
      },
    });
    const result = await loadBoundedTsconfigAliases(root);

    expect(result.pathsMatcher?.("@app/Button")).toEqual([
      path.join(root, "src", "exact.ts"),
    ]);
    expect(result.pathsMatcher?.("@app/components/Card")).toEqual([
      path.join(root, "src", "components", "Card"),
    ]);
  });

  it("replaces inherited paths as one TypeScript compiler option", async () => {
    const root = await tempDir("salt-tsconfig-alias-child-override");
    const parentPaths = Object.fromEntries([
      ["@app/*", ["parent/*"]],
      ...Array.from({ length: 127 }, (_, index) => [
        `@fixture-${index}/*`,
        [`fixture-${index}/*`],
      ]),
    ]);
    await writeJson(path.join(root, "base.json"), {
      compilerOptions: { paths: parentPaths },
    });
    await writeJson(path.join(root, "tsconfig.json"), {
      extends: "./base.json",
      compilerOptions: {
        paths: {
          "@new/*": ["new/*"],
          "@app/*": ["child/*"],
        },
      },
    });
    const result = await loadBoundedTsconfigAliases(root);

    expect(result.pathsMatcher?.("@app/Button")).toEqual([
      path.join(root, "child", "Button"),
    ]);
    expect(result.pathsMatcher?.("@new/Button")).toEqual([
      path.join(root, "new", "Button"),
    ]);
    expect(result.pathsMatcher?.("@fixture-0/Button")).toEqual([]);
  });

  it("inherits baseUrl for child-defined paths and rejects malformed config fields", async () => {
    const root = await tempDir("salt-tsconfig-inherited-base-url");
    await writeJson(path.join(root, "base.json"), {
      compilerOptions: { baseUrl: "./src" },
    });
    await writeJson(path.join(root, "tsconfig.json"), {
      extends: "./base.json",
      compilerOptions: { paths: { "@app/*": ["components/*"] } },
    });
    const inherited = await loadBoundedTsconfigAliases(root);
    expect(inherited.pathsMatcher?.("@app/Button")).toEqual([
      path.join(root, "src", "components", "Button"),
    ]);

    await writeJson(path.join(root, "tsconfig.json"), {
      extends: ["./base.json", 42],
      compilerOptions: {
        baseUrl: 42,
        paths: { "@app/*": ["components/*"] },
      },
    });
    const invalid = await loadBoundedTsconfigAliases(root);
    expect(invalid.limitations).toContain("tsconfig_invalid");
    expect(invalid.pathsMatcher).toBeNull();
  });
});
