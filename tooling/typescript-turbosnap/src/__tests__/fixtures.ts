import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import docgen from "@joshwooding/vite-plugin-react-docgen-typescript";
import { build, type Plugin } from "vite";
import { type createForwardGraph, typescriptTurbosnap } from "../index";

export const appModule = "virtual:/@storybook/builder-vite/vite-app.js";
export const storiesModule =
  "virtual:/@storybook/builder-vite/storybook-stories.js";

export type GraphStats = {
  modules: {
    id: string | number;
    name: string;
    reasons?: { moduleName: string }[];
  }[];
};

type ModuleEvent = Parameters<
  ReturnType<typeof createForwardGraph>["moduleParsed"]
>[0];

const temporaryDirectories = new Set<string>();
const nodeModules = fileURLToPath(
  new URL("../../../../node_modules", import.meta.url),
);

export async function createFixture(files: Record<string, string>) {
  // Vite reports real paths. On macOS os.tmpdir() is a symlink into /private.
  const directory = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), "salt-typescript-turbosnap-")),
  );
  temporaryDirectories.add(directory);

  for (const [filename, contents] of Object.entries(files)) {
    const absolutePath = path.join(directory, filename);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, contents);
  }

  // The temporary project needs the real React types for docgen. Its runtime
  // imports stay external so these tests only build their own source files.
  await fs.symlink(
    nodeModules,
    path.join(directory, "node_modules"),
    "junction",
  );
  return directory;
}

export async function cleanupFixtures() {
  await Promise.all(
    [...temporaryDirectories].map((directory) =>
      fs.rm(directory, { force: true, recursive: true }),
    ),
  );
  temporaryDirectories.clear();
}

export async function buildFixture(directory: string, stories: string[]) {
  const analyzer = typescriptTurbosnap({ rootDir: directory });
  const parsed = new Set<string>();
  const moduleEvents: ModuleEvent[] = [];
  const virtualPlugin: Plugin = {
    name: "fixture-storybook-virtuals",
    resolveId(id) {
      if (id === appModule || id === storiesModule) return `\0${id}`;
    },
    load(id) {
      if (id === `\0${appModule}`) {
        return [
          `import loaders from ${JSON.stringify(storiesModule)};`,
          `import { decorators } from ${JSON.stringify(path.join(directory, ".storybook/preview.ts"))};`,
          "globalThis.fixtureStories = { loaders, decorators };",
        ].join("\n");
      }
      if (id === `\0${storiesModule}`) {
        const loaders = stories.map(
          (filename) =>
            `${JSON.stringify(filename)}: () => import(${JSON.stringify(path.join(directory, filename))})`,
        );
        return `export default { ${loaders.join(",")} };`;
      }
    },
  };
  const result = await build({
    configFile: false,
    root: directory,
    logLevel: "silent",
    resolve: {
      alias: {
        "@fixture": path.join(directory, "src"),
      },
    },
    plugins: [
      virtualPlugin,
      docgen({
        tsconfigPath: path.join(directory, "tsconfig.json"),
        include: [
          "src/Alpha.tsx",
          "src/aug/leaf.tsx",
          "src/jsdoc/Widget.tsx",
          "src/jsdoc/TaggedWidget.tsx",
          "src/CtsWidget.tsx",
        ].map((filename) => path.join(directory, filename)),
        fileSystemCache: false,
        shouldExtractLiteralValuesFromEnum: true,
      }),
      analyzer,
      {
        name: "capture-runtime-module-events",
        moduleParsed(mod) {
          parsed.add(
            path
              .relative(directory, mod.id.split("?")[0])
              .replaceAll("\\", "/"),
          );
          moduleEvents.push({
            id: mod.id,
            importedIds: [...mod.importedIds],
            dynamicallyImportedIds: [...mod.dynamicallyImportedIds],
          });
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: appModule,
        external: ["react", "react/jsx-runtime"],
      },
    },
  });
  const chunks = (Array.isArray(result) ? result : [result]).flatMap(
    (bundle) => {
      if (!("output" in bundle))
        throw new Error("Expected a completed Vite build");
      return bundle.output.filter((item) => item.type === "chunk");
    },
  );

  return {
    stats: analyzer.storybookGetStats().toJson() as GraphStats,
    parsed,
    moduleEvents,
    code: chunks.map((chunk) => chunk.code).join("\n"),
    pluginName: analyzer.name,
  };
}

/**
 * Assert reachability in the emitted reverse graph independently of the
 * analyzer. Stop at story boundaries; a separate path to the shared app entry
 * affects every story. This is deliberately not a replacement for Chromatic's
 * tracing, glob inference, or workflow guards.
 */
export function affectedStories(
  stats: GraphStats,
  stories: string[],
  changed: string,
) {
  const modules = new Map(stats.modules.map((module) => [module.name, module]));
  const storyNames = new Set(stories.map((story) => `./${story}`));
  const visited = new Set<string>();
  const selected = new Set<string>();
  const pending = [`./${changed}`];
  let name = pending.pop();

  while (name) {
    if (!visited.has(name)) {
      visited.add(name);
      if (name === `/${appModule}`) return [...stories].sort();
      if (storyNames.has(name)) selected.add(name.slice(2));
      else {
        for (const reason of modules.get(name)?.reasons ?? []) {
          pending.push(reason.moduleName);
        }
      }
    }
    name = pending.pop();
  }

  return [...selected].sort();
}

export const fixtureFiles: Record<string, string> = {
  "package.json": JSON.stringify({
    private: true,
    type: "module",
    sideEffects: false,
  }),
  "tsconfig.base.json": JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      allowJs: true,
      resolveJsonModule: true,
      types: ["react"],
    },
  }),
  "tsconfig.json": JSON.stringify({
    extends: "./tsconfig.base.json",
    include: ["src", "stories", "ambient.d.ts", "src/data.json"],
  }),
  "ambient.d.ts": "declare const fixtureGlobal: string;",
  "src/generated-commonjs.js":
    "'use strict'; Object.defineProperty(exports, '__esModule', { value: true }); exports.generated = 1;",
  "src/generated-commonjs.cjs": "module.exports = { generated: 1 };",
  "src/commonjs-module.d.cts":
    "declare const generated: { value: number }; export = generated;",
  "src/data.json": '{ "generated": true }',
  "src/umd.d.ts": "export as namespace FixtureUmd; export const value: number;",
  "src/base-props.d.ts":
    "export interface BaseProps { /** inherited description */ label?: 'warmInherited' | 'cool' }",
  "src/props.ts":
    "import type { BaseProps } from './base-props'; export interface AlphaProps extends BaseProps { size?: number }",
  "src/Alpha.tsx": [
    "import { createElement } from 'react';",
    "import type { AlphaProps } from './props';",
    "import css from './alpha.css?inline';",
    "import aliasedCss from '@fixture/aliased-alpha.css?inline';",
    "export function Alpha(props: AlphaProps) { return createElement('button', { style: { color: css && aliasedCss ? 'red' : 'blue' } }, props.label); }",
  ].join("\n"),
  "src/alpha.css": ".alpha { color: red }",
  "src/aliased-alpha.css": ".alpha { background: white }",
  "src/Beta.tsx":
    "import { createElement } from 'react'; export const Beta = () => createElement('span', null, 'Beta');",
  "src/nested-barrel.ts":
    "export { Alpha as InternalAlpha } from './Alpha'; export * from './Beta';",
  "src/barrel.ts":
    "export { InternalAlpha as PublicAlpha } from './nested-barrel'; export * from './nested-barrel';",
  "src/local-alias.ts":
    "import { PublicAlpha as Alias } from './barrel'; export { Alias as LocalAlpha };",
  "src/mixed.ts":
    "export { PublicAlpha } from './barrel'; export const own = 1;",
  "src/function-only.ts": "export function sourceFunction() { return 1; }",
  "src/class-only.ts": "export class SourceClass { value = 1; }",
  "src/shorthand.ts":
    "const shorthand = () => 1; export default { shorthand };",
  "src/__tests__/barrel.ts":
    "export { SourceClass as ThroughTest } from '../class-only';",
  "src/effects/package.json": JSON.stringify({
    sideEffects: true,
    type: "module",
  }),
  "src/effects/register.ts": "globalThis.fixtureEffect = 1; export {};",
  "src/effects/value.ts": "export const effectValue = 1;",
  "src/effects/barrel.ts":
    "import './register'; export { effectValue } from './value';",
  "outside/leaf.ts": "export const Outside = () => 1;",
  "outside/nested.ts": "export * from './leaf';",
  "outside/barrel.ts": "export * from './nested';",
  ".storybook/preview.ts":
    "import { Outside } from '../outside/barrel'; export const decorators = [Outside];",
  "stories/alpha.stories.ts":
    "import { PublicAlpha } from '../src/barrel'; export const Story = PublicAlpha;",
  "stories/beta.stories.ts":
    "import { Beta } from '../src/barrel'; export const Story = Beta;",
  "stories/alias.stories.ts":
    "import { LocalAlpha } from '../src/local-alias'; export const Story = LocalAlpha;",
  "stories/namespace.stories.ts":
    "import * as components from '../src/barrel'; export const Story = () => components.PublicAlpha({});",
  "stories/dynamic.stories.ts":
    "export const Story = async () => (await import('../src/barrel')).Beta();",
  "stories/mixed.stories.ts":
    "import { own } from '../src/mixed'; export const Story = () => own;",
  "stories/function.stories.ts":
    "import { sourceFunction } from '../src/function-only'; export const Story = sourceFunction;",
  "stories/class.stories.ts":
    "import { SourceClass } from '../src/class-only'; export const Story = () => new SourceClass().value;",
  "stories/test-barrel.stories.ts":
    "import { ThroughTest } from '../src/__tests__/barrel'; export const Story = () => new ThroughTest().value;",
  "stories/shorthand.stories.ts":
    "import bag from '../src/shorthand'; export const Story = bag.shorthand;",
  "stories/effect.stories.ts":
    "import { effectValue } from '../src/effects/barrel'; export const Story = () => effectValue;",
  "stories/import-type.stories.ts":
    "export type Shape = import('../src/props').AlphaProps; export const Story = () => 1;",
  "src/namespaces/alpha.ts": "export const alpha = 'alpha-fixture-value';",
  "src/namespaces/beta.ts": "export const beta = 'beta-fixture-value';",
  "src/namespaces/barrel.ts":
    "export * from './alpha'; export * from './beta';",
  "src/namespaces/default.ts":
    "import * as values from './barrel'; export default values;",
  "src/namespaces/named.ts":
    "import * as values from './barrel'; export { values };",
  "src/namespaces/cycle-a.ts":
    "import * as b from './cycle-b'; export { b }; export { alpha } from './alpha';",
  "src/namespaces/cycle-b.ts":
    "import * as a from './cycle-a'; export { a }; export { beta } from './beta';",
  "stories/namespace-default.stories.ts":
    "import values from '../src/namespaces/default'; export const Story = () => values.alpha;",
  "stories/namespace-named.stories.ts":
    "import { values } from '../src/namespaces/named'; export const Story = () => values.alpha;",
  "stories/namespace-cycle-a.stories.ts":
    "import { b } from '../src/namespaces/cycle-a'; export const Story = () => b.a.alpha + b.beta;",
  "stories/namespace-cycle-b.stories.ts":
    "import { a } from '../src/namespaces/cycle-b'; export const Story = () => a.alpha + a.b.beta;",
  "src/aug/leaf.tsx": [
    "import { createElement } from 'react';",
    "export interface Props { label?: string }",
    "export function Widget(props: Props) { return createElement('button', null, props.label); }",
  ].join("\n"),
  "src/aug/barrel.ts": "export { Widget, type Props } from './leaf';",
  "src/aug/augment.d.ts":
    "import './leaf'; declare module './leaf' { interface Props { /** augmented description */ tone?: 'warmAugmented' | 'cool' } }",
  "stories/augmented.stories.ts":
    "import { Widget } from '../src/aug/barrel'; export const Story = Widget;",
  "src/jsdoc/erased.ts":
    "export interface Props { /** JSDoc dependency */ tone?: 'warmJSDocType' | 'cool' }",
  "src/jsdoc/types.js":
    "/** @typedef {import('./erased').Props} Props */\nexport {};",
  "src/jsdoc/Widget.tsx": [
    "import { createElement } from 'react';",
    "import type { Props } from './types.js';",
    "export function JSDocWidget(props: Props) { return createElement('button', null, props.tone); }",
  ].join("\n"),
  "stories/jsdoc-import-type.stories.ts":
    "import { JSDocWidget } from '../src/jsdoc/Widget'; export const Story = JSDocWidget;",
  "src/jsdoc/erased-tag.ts":
    "export interface Props { /** JSDoc import tag dependency */ tone?: 'warmJSDocTag' | 'cool' }",
  "src/jsdoc/tag-types.js": [
    "/** @import { Props as ImportedProps } from './erased-tag' */",
    "/** @typedef {ImportedProps} Props */",
    "export {};",
  ].join("\n"),
  "src/jsdoc/TaggedWidget.tsx": [
    "import { createElement } from 'react';",
    "import type { Props } from './tag-types.js';",
    "export function JSDocTaggedWidget(props: Props) { return createElement('button', null, props.tone); }",
  ].join("\n"),
  "stories/jsdoc-import-tag.stories.ts":
    "import { JSDocTaggedWidget } from '../src/jsdoc/TaggedWidget'; export const Story = JSDocTaggedWidget;",
  "src/globals.d.cts":
    "interface CtsGlobalProps { /** ambient declaration dependency */ tone?: 'warmCts' | 'cool' }",
  "src/CtsWidget.tsx": [
    "import { createElement } from 'react';",
    "export function CtsWidget(props: CtsGlobalProps) { return createElement('button', null, props.tone); }",
  ].join("\n"),
  "stories/cts-global.stories.ts":
    "import { CtsWidget } from '../src/CtsWidget'; export const Story = CtsWidget;",
};
