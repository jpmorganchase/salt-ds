import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Type checks a small application (test/consumer-types) against the built
// declarations of the Salt packages, once for each supported major version of
// the React types. Run `yarn build` first.

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const nodeModules = path.join(rootDir, "node_modules");
const fixtureDir = path.join(rootDir, "test", "consumer-types");

// `@types/react` is the version the repo is developed with; the other majors
// are installed as `types-react-<major>` aliases.
const reactTypes = {
  16: ["types-react-16", "types-react-dom-16"],
  17: ["types-react-17", "types-react-dom-17"],
  18: ["@types/react", "@types/react-dom"],
  19: ["types-react-19", "types-react-dom-19"],
};

const packagesWithTypes = [
  "core",
  "countries",
  "date-adapters",
  "date-components",
  "embla-carousel",
  "highcharts-theme",
  "icons",
  "lab",
  "styles",
  "window",
];

const unbuilt = packagesWithTypes.filter(
  (name) => !existsSync(path.join(rootDir, "packages", name, "dist-types")),
);
if (unbuilt.length > 0) {
  console.error(
    `Missing declarations for ${unbuilt.join(", ")}. Run \`yarn build\` first.`,
  );
  process.exit(1);
}

// TypeScript falls back to `@types/react` if a version isn't installed, which
// would silently check the wrong version.
const missingTypes = Object.values(reactTypes)
  .flat()
  .filter((name) => !existsSync(path.join(nodeModules, name, "index.d.ts")));
if (missingTypes.length > 0) {
  console.error(
    `Missing ${missingTypes.join(", ")}. Run \`yarn\` to install them.`,
  );
  process.exit(1);
}

const builtDeclarations = /^packages[\\/][^\\/]+[\\/]dist-types[\\/]/;

// Errors in third-party declarations are reported separately, as they can't be
// fixed in Salt.
function isSaltOrFixtureFile(fileName) {
  return (
    path.resolve(fileName).startsWith(fixtureDir + path.sep) ||
    builtDeclarations.test(path.relative(rootDir, fileName))
  );
}

const formatHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => rootDir,
  getNewLine: () => "\n",
};

let failed = false;

for (const [version, [react, reactDom]] of Object.entries(reactTypes)) {
  const reactDir = path.join(nodeModules, react);
  const reactDomDir = path.join(nodeModules, reactDom);

  const program = ts.createProgram({
    rootNames: [path.join(fixtureDir, "index.tsx")],
    options: {
      jsx: ts.JsxEmit.ReactJSX,
      lib: ["lib.es2020.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
      skipLibCheck: false,
      strict: true,
      target: ts.ScriptTarget.ES2020,
      types: [],
      paths: {
        react: [path.join(reactDir, "index.d.ts")],
        "react/*": [path.join(reactDir, "*")],
        "react-dom": [path.join(reactDomDir, "index.d.ts")],
        "react-dom/*": [path.join(reactDomDir, "*")],
      },
    },
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);
  const saltDiagnostics = diagnostics.filter(
    (diagnostic) =>
      !diagnostic.file || isSaltOrFixtureFile(diagnostic.file.fileName),
  );
  const otherCount = diagnostics.length - saltDiagnostics.length;
  const otherNote =
    otherCount > 0 ? ` (${otherCount} in third-party declarations)` : "";

  if (saltDiagnostics.length > 0) {
    failed = true;
    console.error(
      `React ${version} types: ${saltDiagnostics.length} errors${otherNote}`,
    );
    console.error(ts.formatDiagnostics(saltDiagnostics, formatHost));
  } else {
    console.log(`React ${version} types: no errors${otherNote}`);
  }
}

process.exitCode = failed ? 1 : 0;
