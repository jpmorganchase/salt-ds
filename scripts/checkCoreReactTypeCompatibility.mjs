import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { resolvePackageArchiveEntry } from "./packageArchivePath.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const builtCoreRoot = path.join(repoRoot, "dist", "salt-ds-core");
const repositoryResolutionAnchor = path.join(
  repoRoot,
  "scripts",
  "core-react-type-compatibility-anchor.ts",
);
const REACT_TYPES_FLOOR_VERSION = "18.3.0";
const REACT_TYPES_PEER_RANGE = `>=${REACT_TYPES_FLOOR_VERSION}`;
const RUNTIME_REACT_PEER_RANGE = ">=16.14.0";
const fixtures = [
  {
    label: "React type-definition advertised floor",
    reactAlias: "react-types-floor-fixture",
    reactDomAlias: "react-dom-types-floor-fixture",
    reactDomVersion: REACT_TYPES_FLOOR_VERSION,
    reactVersion: REACT_TYPES_FLOOR_VERSION,
  },
  {
    label: "React 18 repository current",
    reactAlias: "react-types-18-fixture",
    reactDomAlias: "react-dom-types-18-fixture",
    reactDomVersion: "18.3.7",
    reactVersion: "18.3.31",
  },
];

const saltDependencyRoots = new Map([
  ["@salt-ds/icons", path.join(repoRoot, "dist", "salt-ds-icons")],
  ["@salt-ds/styles", path.join(repoRoot, "dist", "salt-ds-styles")],
  ["@salt-ds/window", path.join(repoRoot, "dist", "salt-ds-window")],
]);

function fail(message) {
  throw new Error(message);
}

function isWithin(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return (
    relative === "" ||
    (!path.isAbsolute(relative) &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`))
  );
}

function run(command, args, cwd, label) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    fail(
      `${label} failed (${result.error?.message ?? `exit ${result.status}`}).\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result.stdout;
}

async function readExactPackageManifest(
  packageRoot,
  expectedName,
  expectedVersion,
) {
  const manifest = JSON.parse(
    await fs.readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  if (manifest.name !== expectedName || manifest.version !== expectedVersion) {
    fail(
      `${packageRoot} resolved ${String(manifest.name)}@${String(manifest.version)}; expected ${expectedName}@${expectedVersion}.`,
    );
  }
}

async function assertPublishedReactPeerContract(packageRoot, expectedName) {
  const manifest = JSON.parse(
    await fs.readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  if (manifest.name !== expectedName) {
    fail(
      `${packageRoot} resolved ${String(manifest.name)}; expected ${expectedName}.`,
    );
  }
  const expectedPeers = {
    "@types/react": REACT_TYPES_PEER_RANGE,
    react: RUNTIME_REACT_PEER_RANGE,
    "react-dom": RUNTIME_REACT_PEER_RANGE,
  };
  for (const [peerName, expectedRange] of Object.entries(expectedPeers)) {
    const receivedRange = manifest.peerDependencies?.[peerName];
    if (receivedRange !== expectedRange) {
      fail(
        `${expectedName} published peer ${peerName} is ${String(receivedRange)}; expected exactly ${expectedRange}.`,
      );
    }
  }
}

async function packCore(temporaryRoot) {
  const packRoot = path.join(temporaryRoot, "pack");
  const extractionRoot = path.join(temporaryRoot, "extract");
  await fs.mkdir(packRoot, { recursive: true });
  await fs.mkdir(extractionRoot, { recursive: true });
  const npmCommand = process.platform === "win32" ? process.execPath : "npm";
  const npmArgs =
    process.platform === "win32"
      ? [
          path.join(
            path.dirname(process.execPath),
            "node_modules",
            "npm",
            "bin",
            "npm-cli.js",
          ),
        ]
      : [];
  const packOutput = run(
    npmCommand,
    [
      ...npmArgs,
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      packRoot,
      builtCoreRoot,
    ],
    temporaryRoot,
    "Core npm pack",
  );
  const metadata = JSON.parse(packOutput);
  const packed = Array.isArray(metadata) ? metadata[0] : metadata;
  if (
    !packed ||
    typeof packed.filename !== "string" ||
    path.basename(packed.filename) !== packed.filename
  ) {
    fail("Core npm pack returned an unsafe or missing filename.");
  }
  const tarballPath = path.resolve(packRoot, packed.filename);
  if (!isWithin(packRoot, tarballPath) || !lstatSync(tarballPath).isFile()) {
    fail(
      "Core npm pack output did not resolve to a regular file beneath the temporary pack directory.",
    );
  }

  const listing = run(
    "tar",
    ["-tzf", tarballPath],
    temporaryRoot,
    "Core tar listing",
  );
  const entries = listing.split(/\r?\n/u).filter(Boolean);
  if (entries.length === 0) {
    fail("Core tarball contained no entries.");
  }
  for (const entry of entries) {
    resolvePackageArchiveEntry(extractionRoot, entry);
  }
  run(
    "tar",
    ["-xzf", tarballPath, "-C", extractionRoot],
    temporaryRoot,
    "Core tar extraction",
  );
  const extractedCoreRoot = path.join(extractionRoot, "package");
  if (!lstatSync(extractedCoreRoot).isDirectory()) {
    fail("Core tarball did not extract a package directory.");
  }
  return extractedCoreRoot;
}

function compilerOptions() {
  return {
    allowSyntheticDefaultImports: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: false,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
  };
}

function declarationExtension(fileName) {
  if (fileName.endsWith(".d.mts")) {
    return ts.Extension.Dmts;
  }
  if (fileName.endsWith(".d.cts")) {
    return ts.Extension.Dcts;
  }
  return ts.Extension.Dts;
}

function resolveMappedPackage(moduleName, packageName, packageRoot) {
  if (moduleName !== packageName && !moduleName.startsWith(`${packageName}/`)) {
    return undefined;
  }
  let relativeTarget;
  if (moduleName === packageName) {
    const manifest = JSON.parse(
      readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    );
    relativeTarget = manifest.types ?? manifest.typings ?? "index.d.ts";
  } else {
    relativeTarget = moduleName.slice(packageName.length + 1);
  }
  const unresolved = path.join(packageRoot, ...relativeTarget.split("/"));
  const candidates = [
    unresolved,
    `${unresolved}.d.ts`,
    `${unresolved}.d.mts`,
    `${unresolved}.d.cts`,
    path.join(unresolved, "index.d.ts"),
    path.join(unresolved, "index.d.mts"),
    path.join(unresolved, "index.d.cts"),
  ];
  const resolvedFileName = candidates.find((candidate) =>
    existsSync(candidate),
  );
  if (!resolvedFileName) {
    fail(
      `Mapped package request ${moduleName} has no declaration beneath ${packageRoot}.`,
    );
  }
  return {
    extension: declarationExtension(resolvedFileName),
    isExternalLibraryImport: true,
    resolvedFileName,
  };
}

function resolveProgram(rootName, options, packageMappings) {
  const receipt = [];
  const host = ts.createCompilerHost(options);
  host.resolveModuleNames = (moduleNames, containingFile) =>
    moduleNames.map((moduleName) => {
      let resolution;
      for (const [packageName, packageRoot] of packageMappings) {
        resolution = resolveMappedPackage(moduleName, packageName, packageRoot);
        if (resolution) {
          break;
        }
      }
      resolution ??= ts.resolveModuleName(
        moduleName,
        containingFile,
        options,
        host,
      ).resolvedModule;
      if (
        !resolution &&
        !moduleName.startsWith(".") &&
        !path.isAbsolute(moduleName)
      ) {
        resolution = ts.resolveModuleName(
          moduleName,
          repositoryResolutionAnchor,
          options,
          host,
        ).resolvedModule;
      }
      receipt.push({
        containingFile,
        moduleName,
        resolvedFileName: resolution?.resolvedFileName ?? null,
      });
      return resolution;
    });
  const program = ts.createProgram({ host, options, rootNames: [rootName] });
  return { diagnostics: ts.getPreEmitDiagnostics(program), receipt };
}

function assertResolutionBoundary({
  extractedCoreRoot,
  fixture,
  reactDomRoot,
  reactRoot,
  receipt,
  requireCore,
}) {
  const reactResolutions = receipt.filter(
    ({ moduleName }) =>
      moduleName === "react" || moduleName.startsWith("react/"),
  );
  const reactDomResolutions = receipt.filter(
    ({ moduleName }) =>
      moduleName === "react-dom" || moduleName.startsWith("react-dom/"),
  );
  if (
    !reactResolutions.some(
      ({ resolvedFileName }) =>
        resolvedFileName && isWithin(reactRoot, resolvedFileName),
    ) ||
    !reactDomResolutions.some(
      ({ resolvedFileName }) =>
        resolvedFileName && isWithin(reactDomRoot, resolvedFileName),
    )
  ) {
    fail(
      `${fixture.label} did not resolve both React and ReactDOM from its exact fixture roots.\n${JSON.stringify(receipt, null, 2)}`,
    );
  }
  for (const resolution of [...reactResolutions, ...reactDomResolutions]) {
    if (!resolution.resolvedFileName) {
      fail(`${fixture.label} did not resolve ${resolution.moduleName}.`);
    }
    const expectedRoot = resolution.moduleName.startsWith("react-dom")
      ? reactDomRoot
      : reactRoot;
    if (!isWithin(expectedRoot, resolution.resolvedFileName)) {
      fail(
        `${fixture.label} resolved ${resolution.moduleName} outside its fixture root: ${resolution.resolvedFileName}`,
      );
    }
  }
  if (requireCore) {
    const coreResolution = receipt.find(
      ({ moduleName }) => moduleName === "@salt-ds/core",
    );
    if (
      !coreResolution?.resolvedFileName ||
      !isWithin(extractedCoreRoot, coreResolution.resolvedFileName)
    ) {
      fail(`${fixture.label} did not resolve Core from the extracted tarball.`);
    }
  }
}

function assertNoDiagnostics(label, diagnostics, receipt) {
  if (diagnostics.length === 0) {
    return;
  }
  const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => repoRoot,
    getNewLine: () => os.EOL,
  });
  fail(
    `${label} failed.\nResolution receipt:\n${JSON.stringify(receipt, null, 2)}\nDiagnostics:\n${formatted}`,
  );
}

async function verifyFixture(temporaryRoot, extractedCoreRoot, fixture) {
  const reactRoot = path.join(repoRoot, "node_modules", fixture.reactAlias);
  const reactDomRoot = path.join(
    repoRoot,
    "node_modules",
    fixture.reactDomAlias,
  );
  await readExactPackageManifest(
    reactRoot,
    "@types/react",
    fixture.reactVersion,
  );
  await readExactPackageManifest(
    reactDomRoot,
    "@types/react-dom",
    fixture.reactDomVersion,
  );
  const options = compilerOptions();
  const packageMappings = [
    ["react-dom", reactDomRoot],
    ["react", reactRoot],
    ["@salt-ds/core", extractedCoreRoot],
    ...saltDependencyRoots,
  ].sort(([left], [right]) => right.length - left.length);
  const cellRoot = path.join(temporaryRoot, fixture.reactAlias);
  await fs.mkdir(cellRoot, { recursive: true });

  const baselinePath = path.join(cellRoot, "react-baseline.ts");
  await fs.writeFile(
    baselinePath,
    [
      'import type { ReactElement } from "react";',
      'import type * as ReactDOM from "react-dom";',
      "export declare const element: ReactElement;",
      "export type ReactDomApi = typeof ReactDOM;",
      "",
    ].join("\n"),
  );
  const baseline = resolveProgram(baselinePath, options, packageMappings);
  assertResolutionBoundary({
    extractedCoreRoot,
    fixture,
    reactDomRoot,
    reactRoot,
    receipt: baseline.receipt,
    requireCore: false,
  });
  assertNoDiagnostics(
    `${fixture.label} React/ReactDOM baseline`,
    baseline.diagnostics,
    baseline.receipt,
  );

  const coreConsumerPath = path.join(cellRoot, "core-consumer.ts");
  await fs.writeFile(
    coreConsumerPath,
    [
      'import type { ReactElement } from "react";',
      'import * as CorePublicApi from "@salt-ds/core";',
      'import { BreakpointProvider } from "@salt-ds/core/dist-types/breakpoints/BreakpointProvider";',
      'import { Menu } from "@salt-ds/core/dist-types/menu/Menu";',
      'import { SaltProvider } from "@salt-ds/core/dist-types/salt-provider/SaltProvider";',
      "type ElementOnly<T extends ReactElement> = T;",
      "export type BreakpointProviderResult = ElementOnly<ReturnType<typeof BreakpointProvider>>;",
      "export type MenuResult = ElementOnly<ReturnType<typeof Menu>>;",
      "export type SaltProviderResult = ElementOnly<ReturnType<typeof SaltProvider>>;",
      "export type CorePublicSurface = typeof CorePublicApi;",
      "",
    ].join("\n"),
  );
  const core = resolveProgram(coreConsumerPath, options, packageMappings);
  assertResolutionBoundary({
    extractedCoreRoot,
    fixture,
    reactDomRoot,
    reactRoot,
    receipt: [...baseline.receipt, ...core.receipt],
    requireCore: true,
  });
  assertNoDiagnostics(
    `${fixture.label} packed Core consumer`,
    core.diagnostics,
    core.receipt,
  );
  process.stdout.write(`${fixture.label}: packed declarations compatible.\n`);
}

if (process.argv.length !== 2) {
  fail(
    `checkCoreReactTypeCompatibility.mjs accepts no arguments: ${process.argv.slice(2).join(" ")}`,
  );
}
if (!existsSync(builtCoreRoot)) {
  fail("dist/salt-ds-core is missing. Run yarn build before this check.");
}
for (const [packageName, packageRoot] of saltDependencyRoots) {
  if (!existsSync(packageRoot)) {
    fail(
      `${packageName} built package is missing at ${packageRoot}. Run yarn build first.`,
    );
  }
}

const temporaryRoot = await fs.mkdtemp(
  path.join(os.tmpdir(), "salt-core-react-types-"),
);
try {
  const extractedCoreRoot = await packCore(temporaryRoot);
  await assertPublishedReactPeerContract(extractedCoreRoot, "@salt-ds/core");
  await assertPublishedReactPeerContract(
    saltDependencyRoots.get("@salt-ds/window"),
    "@salt-ds/window",
  );
  for (const fixture of fixtures) {
    await verifyFixture(temporaryRoot, extractedCoreRoot, fixture);
  }
} finally {
  await fs.rm(temporaryRoot, { force: true, recursive: true });
}
