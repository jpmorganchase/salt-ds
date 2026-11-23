import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { SourceMap } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { buildPackage } from "../buildPackage.mjs";

let cwd;

async function write(name, contents) {
  const filename = path.join(cwd, name);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, contents);
}

async function dependency(name, manifest = {}) {
  await write(
    `node_modules/${name}/package.json`,
    JSON.stringify({
      name,
      main: "index.js",
      types: "index.d.ts",
      ...manifest,
    }),
  );
  await write(
    `node_modules/${name}/index.js`,
    "exports.identity = (value) => value;",
  );
  await write(
    `node_modules/${name}/index.d.ts`,
    "export declare function identity(value: string): string;",
  );
}

beforeEach(async () => {
  cwd = await mkdtemp(path.join(tmpdir(), "salt-client-modules-test-"));
  await write("package.json", JSON.stringify({ name: "salt-client-test" }));
  await write(
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: {
        target: "es2020",
        module: "esnext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        types: [],
      },
    }),
  );
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

it("marks React consumers through barrels while preserving server utilities and source maps", async () => {
  await dependency("react");
  await write(
    "node_modules/react/index.d.ts",
    `export interface Context<T> { value: T; }
export declare function createContext<T>(value: T): Context<T>;`,
  );
  await write(
    "node_modules/react/jsx-runtime.d.ts",
    `export namespace JSX {
  interface Element { readonly type: string; }
  interface IntrinsicElements { span: { children?: string }; }
}`,
  );
  await write(
    "node_modules/react/jsx-runtime.js",
    "exports.jsx = (type, props) => ({ type, props });",
  );
  const directSource = `import { createContext } from "react";
export function makeContext(value: string) { return createContext(value); }
export const DirectContext = makeContext("direct-value");`;
  await write("src/direct.ts", directSource);
  await write(
    "src/barrel.ts",
    `import { makeContext } from "./direct";
export { makeContext };
export const metadata = { makeContext: "server-safe" };`,
  );
  await write(
    "src/transitive.ts",
    `import { makeContext } from "./barrel";
export const TransitiveContext = makeContext("transitive-value");`,
  );
  await write(
    "src/utility.ts",
    `import type { Context } from "react";
export type StringContext = Context<string>;
export function makePrefixer(value: string) { return "prefix-" + value; }`,
  );
  await write(
    "src/shared.ts",
    `export * from "./direct";
export * from "./utility";
export { makeContext as createContextAlias } from "./direct";`,
  );
  await write(
    "src/throughStar.ts",
    `import { createContextAlias as makeAliasedContext } from "./shared";
export const StarContext = makeAliasedContext("star-value");`,
  );
  await write(
    "src/StaticComponent.tsx",
    "export function StaticComponent() { return <span>Client content</span>; }",
  );
  await write(
    "src/enumContext.ts",
    `import { createContext } from "react";
export enum ContextValues { Initial = createContext(1).value }`,
  );
  await write(
    "src/index.ts",
    `import { makePrefixer as prefix } from "./shared";
export { DirectContext } from "./direct";
export { TransitiveContext } from "./transitive";
export { StarContext } from "./throughStar";
export { StaticComponent } from "./StaticComponent";
export { ContextValues } from "./enumContext";
export { prefix as makePrefixer };
export const mixedValue = prefix("mixed");`,
  );

  await buildPackage({
    cwd,
    entries: [{ input: { index: "src/index.ts", barrel: "src/barrel.ts" } }],
  });

  for (const directory of ["dist-es", "dist-cjs"]) {
    for (const name of [
      "direct",
      "transitive",
      "throughStar",
      "StaticComponent",
      "enumContext",
    ]) {
      const code = await readFile(
        path.join(cwd, directory, `${name}.js`),
        "utf8",
      );
      expect(code, `${directory}/${name}.js`).toMatch(/^"use client";/);
    }
    for (const name of ["index", "barrel", "utility"]) {
      const code = await readFile(
        path.join(cwd, directory, `${name}.js`),
        "utf8",
      );
      expect(code, `${directory}/${name}.js`).not.toContain('"use client"');
    }

    const code = await readFile(path.join(cwd, directory, "direct.js"), "utf8");
    const map = new SourceMap(
      JSON.parse(
        await readFile(path.join(cwd, directory, "direct.js.map"), "utf8"),
      ),
    );
    const generatedLines = code.split("\n");
    const generatedLine = generatedLines.findIndex((line) =>
      line.includes('"direct-value"'),
    );
    expect(generatedLine).toBeGreaterThan(0);
    const entry = map.findEntry(
      generatedLine,
      generatedLines[generatedLine].indexOf('"direct-value"'),
    );
    expect(entry.originalSource).toMatch(/direct\.ts$/);
    expect(entry.originalLine).toBe(2);
    expect(entry.originalColumn).toBe(
      directSource.split("\n")[2].indexOf('"direct-value"'),
    );
  }
}, 30_000);

it("marks external Salt and React dependencies without marking unrelated utilities or package barrels", async () => {
  await dependency("@salt-ds/fixture");
  await dependency("react-peer-fixture", {
    peerDependencies: { react: "*" },
  });
  await dependency("react-dependency-fixture", {
    dependencies: { "react-dom": "*" },
  });
  await dependency("plain-fixture");

  const modules = {
    salt: "@salt-ds/fixture",
    peer: "react-peer-fixture",
    dependency: "react-dependency-fixture",
    plain: "plain-fixture",
  };
  for (const [name, packageName] of Object.entries(modules)) {
    await write(
      `src/${name}.ts`,
      `import { identity } from "${packageName}";
export const ${name}Value = identity("${name}");`,
    );
  }
  await write(
    "src/index.ts",
    Object.keys(modules)
      .map((name) => `export { ${name}Value } from "./${name}";`)
      .join("\n"),
  );

  await buildPackage({ cwd });

  for (const directory of ["dist-es", "dist-cjs"]) {
    for (const name of ["salt", "peer", "dependency"]) {
      const code = await readFile(
        path.join(cwd, directory, `${name}.js`),
        "utf8",
      );
      expect(code, `${directory}/${name}.js`).toMatch(/^"use client";/);
    }
    for (const name of ["index", "plain"]) {
      const code = await readFile(
        path.join(cwd, directory, `${name}.js`),
        "utf8",
      );
      expect(code, `${directory}/${name}.js`).not.toContain('"use client"');
    }
  }
}, 30_000);
