import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runTypeScript } from "./typescript.mjs";

// Type checks the repo against another major version of the React types, e.g.
// `yarn typecheck:react19`. The default `yarn typecheck` uses the React types
// installed as `@types/react`; other majors are installed as `types-react-<major>`
// aliases and swapped in through `paths`, so both can be checked from one install.

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const [version, ...typescriptArgs] = process.argv.slice(2);

if (!/^\d+$/.test(version ?? "")) {
  console.error(
    "Usage: yarn node ./scripts/typecheckReactTypes.mjs <react major> [tsc args]",
  );
  process.exit(1);
}

const baseConfigPath = path.join(rootDir, "tsconfig.json");
const baseConfig = JSON.parse(await readFile(baseConfigPath, "utf8"));
const nodeModules = path.join(rootDir, "node_modules");

// `paths` replaces the inherited value instead of merging with it, so copy the
// repo's aliases and make them absolute for the generated config's location.
const paths = Object.fromEntries(
  Object.entries(baseConfig.compilerOptions?.paths ?? {}).map(
    ([alias, targets]) => [
      alias,
      targets.map((target) => path.resolve(rootDir, target)),
    ],
  ),
);
const reactTypes = path.join(nodeModules, `types-react-${version}`);
const reactDomTypes = path.join(nodeModules, `types-react-dom-${version}`);
Object.assign(paths, {
  react: [path.join(reactTypes, "index.d.ts")],
  "react/*": [path.join(reactTypes, "*")],
  "react-dom": [path.join(reactDomTypes, "index.d.ts")],
  "react-dom/*": [path.join(reactDomTypes, "*")],
});

const configDirectory = path.join(nodeModules, ".cache", "salt-ds");
const configPath = path.join(configDirectory, `tsconfig.react${version}.json`);
await mkdir(configDirectory, { recursive: true });
await writeFile(
  configPath,
  JSON.stringify({ extends: baseConfigPath, compilerOptions: { paths } }),
);

console.log(`Type checking against React ${version} types`);
process.exitCode = await runTypeScript([
  "--noEmit",
  "-p",
  configPath,
  ...typescriptArgs,
]);
