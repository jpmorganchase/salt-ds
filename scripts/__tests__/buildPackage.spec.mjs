import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildPackage } from "../buildPackage.mjs";

describe("package builds", () => {
  let cwd;

  async function write(name, contents) {
    const filename = path.join(cwd, name);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, contents);
  }

  beforeEach(async () => {
    cwd = await mkdtemp(path.join(tmpdir(), "salt-build-test-"));
    await write("package.json", JSON.stringify({ name: "salt-build-test" }));
    await write(
      "tsconfig.json",
      JSON.stringify({
        compilerOptions: {
          target: "es2020",
          module: "esnext",
          moduleResolution: "bundler",
          strict: true,
          types: [],
        },
      }),
    );
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("preserves CSS, module paths, external imports and consumer environment checks", async () => {
    const css =
      '/* keep this comment */\n.Button { --label: "exact"; color: red; }\n';
    await write("src/Button.css", css);
    await write(
      "src/css.d.ts",
      'declare module "*.css" { const css: string; export default css; }',
    );
    await write("src/tokens.ts", 'export const suffix = "-salt";');
    await write("src/index.ts", 'export { Button } from "./Button";');
    await write(
      "src/Button.ts",
      `import css from "./Button.css";
import { suffix } from "./tokens";
import { identity } from "build-test-dependency";
declare const process: { env: { NODE_ENV?: string } };
export function Button() {
  return identity(css + suffix + (process.env.NODE_ENV === "production" ? "prod" : "dev"));
}`,
    );
    await write(
      "node_modules/build-test-dependency/package.json",
      JSON.stringify({
        name: "build-test-dependency",
        main: "index.js",
        types: "index.d.ts",
      }),
    );
    await write(
      "node_modules/build-test-dependency/index.js",
      "exports.identity = (value) => value;",
    );
    await write(
      "node_modules/build-test-dependency/index.d.ts",
      "export declare function identity(value: string): string;",
    );
    for (const directory of ["dist-es", "dist-cjs", "dist-types"]) {
      await write(`${directory}/stale.js`, "stale");
    }

    await buildPackage({ cwd });

    const require = createRequire(path.join(cwd, "package.json"));
    const builtCss = require("./dist-cjs/Button.css.js");
    expect(typeof builtCss).toBe("string");
    expect(builtCss).toBe(css);
    expect(require("./dist-cjs/index.js").Button()).toBe(
      `${css}-salt${process.env.NODE_ENV === "production" ? "prod" : "dev"}`,
    );
    for (const directory of ["dist-es", "dist-cjs"]) {
      const files = await readdir(path.join(cwd, directory));
      expect(files).toEqual(
        expect.arrayContaining([
          "index.js",
          "Button.js",
          "Button.css.js",
          "tokens.js",
        ]),
      );
      expect(files).not.toContain("stale.js");
      const button = await readFile(
        path.join(cwd, directory, "Button.js"),
        "utf8",
      );
      expect(button).toContain("build-test-dependency");
      expect(button).toContain("process.env.NODE_ENV");
      const map = JSON.parse(
        await readFile(path.join(cwd, directory, "Button.js.map"), "utf8"),
      );
      expect(map.sourcesContent).toContain(
        await readFile(path.join(cwd, "src/Button.ts"), "utf8"),
      );
    }
    expect(await readdir(path.join(cwd, "dist-types"))).not.toContain(
      "stale.js",
    );
    expect(
      await readFile(path.join(cwd, "dist-types/Button.d.ts"), "utf8"),
    ).toContain("Button(): string");
  }, 30_000);

  it("preserves default-export deep imports alongside the package entry", async () => {
    await write(
      "src/index.ts",
      'export { default as Item } from "./internal/Item";',
    );
    await write(
      "src/internal/Item.ts",
      "export default function Item() { return 42; }",
    );

    await buildPackage({
      cwd,
      entries: [
        {
          input: {
            index: "src/index.ts",
            "internal/Item": "src/internal/Item.ts",
          },
        },
      ],
    });

    const require = createRequire(path.join(cwd, "package.json"));
    const Item = require("./dist-cjs/internal/Item.js");
    expect(typeof Item).toBe("function");
    expect(Item()).toBe(42);
    expect(require("./dist-cjs/index.js").Item).toBe(Item);
  }, 30_000);

  it("fails on declaration type errors and removes its temporary configuration", async () => {
    await write("src/index.ts", "export const answer: string = 42;");
    // A package-level noCheck option must not silently disable declaration checks.
    const config = JSON.parse(
      await readFile(path.join(cwd, "tsconfig.json"), "utf8"),
    );
    config.compilerOptions.noCheck = true;
    await write("tsconfig.json", JSON.stringify(config));

    await expect(buildPackage({ cwd })).rejects.toThrow(
      "Could not build salt-build-test",
    );
    expect(await readdir(path.join(cwd, "dist-types"))).toEqual([]);
    expect(
      (await readdir(cwd)).some((name) => name.startsWith(".salt-types-")),
    ).toBe(false);
  }, 30_000);

  it("requires the package's own tsconfig for declarations", async () => {
    // Relative options in an ancestor tsconfig would resolve from the package.
    const packageDirectory = path.join(cwd, "packages/no-tsconfig");
    await write(
      "packages/no-tsconfig/package.json",
      JSON.stringify({ name: "salt-build-no-tsconfig" }),
    );
    await write("packages/no-tsconfig/src/index.ts", "export const a = 1;");

    const error = await buildPackage({ cwd: packageDirectory }).catch(
      (reason) => reason,
    );

    expect(error).toBeInstanceOf(AggregateError);
    expect(error.errors.map(({ message }) => message)).toContainEqual(
      expect.stringMatching(/no-tsconfig must have its own tsconfig\.json$/),
    );
    expect(await readdir(packageDirectory)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^\.salt-types-/)]),
    );
  }, 30_000);
});
