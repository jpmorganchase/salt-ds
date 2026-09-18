import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createWindowsCmdInvocation } from "./consumer-smoke/shared.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const packageDir = path.join(repoRoot, "dist", "salt-ds-date-adapters");
const requiredPackedFiles = [
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "dist-cjs/package.json",
  "dist-es/package.json",
  "package.json",
];

function fail(message) {
  throw new Error(`Date Adapters package verification failed: ${message}`);
}

function containedFile(relativePath, label) {
  if (
    typeof relativePath !== "string" ||
    relativePath.includes("\\") ||
    path.posix.isAbsolute(relativePath) ||
    path.posix.normalize(relativePath) !== relativePath ||
    relativePath === ".." ||
    relativePath.startsWith("../")
  ) {
    fail(`${label} is not a contained portable package path: ${relativePath}`);
  }
  const absolutePath = path.resolve(packageDir, ...relativePath.split("/"));
  const relative = path.relative(packageDir, absolutePath);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    fail(`${label} escapes the built package: ${relativePath}`);
  }
  return absolutePath;
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is absent or invalid JSON (${error.message}).`);
  }
}

async function requireRegularFile(filePath, label) {
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch (error) {
    fail(`${label} is missing (${error.message}).`);
  }
  if (!stats.isFile()) fail(`${label} is not a regular file.`);
}

function run(command, args, label, cwd = repoRoot) {
  const windowsInvocation =
    process.platform === "win32"
      ? createWindowsCmdInvocation(command, args)
      : undefined;
  const result = spawnSync(
    windowsInvocation?.command ?? command,
    windowsInvocation?.args ?? args,
    {
      cwd,
      encoding: "utf8",
      windowsHide: true,
      windowsVerbatimArguments:
        windowsInvocation?.windowsVerbatimArguments ?? false,
    },
  );
  if (result.error) fail(`${label} could not start (${result.error.message}).`);
  if (result.status !== 0) {
    fail(
      `${label} exited ${result.status}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  if (/MODULE_TYPELESS_PACKAGE_JSON/u.test(result.stderr)) {
    fail(`${label} relied on typeless-module syntax detection.`);
  }
  if (result.stderr) process.stderr.write(result.stderr);
  return result.stdout;
}

async function verifyInstalledConsumer({
  exportPath,
  peerPackages,
  tarballPath,
  verificationRoot,
}) {
  const label = exportPath === "." ? "root" : exportPath.slice(2);
  const consumerRoot = path.join(verificationRoot, `consumer-${label}`);
  await fs.mkdir(consumerRoot, { recursive: true });
  await fs.writeFile(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify({ name: `date-adapters-${label}-consumer`, private: true, type: "module" }, null, 2)}\n`,
    "utf8",
  );
  const localPeerSpecs = peerPackages.map(
    (packageName) =>
      pathToFileURL(
        path.join(repoRoot, "node_modules", ...packageName.split("/")),
      ).href,
  );
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  run(
    npmCommand,
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
      "--offline",
      "--no-save",
      tarballPath,
      ...localPeerSpecs,
    ],
    `${label} isolated install`,
    consumerRoot,
  );

  const specifier = `@salt-ds/date-adapters${
    exportPath === "." ? "" : exportPath.slice(1)
  }`;
  run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      "await import(process.argv[1]);",
      specifier,
    ],
    `${label} installed ESM import`,
    consumerRoot,
  );
  run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'import { createRequire } from "node:module"; createRequire(import.meta.url)(process.argv[1]);',
      specifier,
    ],
    `${label} installed CommonJS require`,
    consumerRoot,
  );
  await fs.writeFile(
    path.join(consumerRoot, "consumer.ts"),
    `import * as adapter from ${JSON.stringify(specifier)};\nexport const loaded = adapter;\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
          target: "ES2022",
          strict: true,
          noEmit: true,
          skipLibCheck: false,
        },
        include: ["consumer.ts"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  run(
    process.execPath,
    [
      path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
      "-p",
      ".",
    ],
    `${label} installed declaration typecheck`,
    consumerRoot,
  );
}

function verifyNativeLoads(kind, absoluteTargets, nodeOptions = []) {
  const expression =
    kind === "import"
      ? "for (const target of JSON.parse(process.argv[1])) await import(target);"
      : [
          'import { createRequire } from "node:module";',
          "const require = createRequire(import.meta.url);",
          "for (const target of JSON.parse(process.argv[1])) require(target);",
        ].join(" ");
  const targets = absoluteTargets.map((target) =>
    kind === "import" ? pathToFileURL(target).href : target,
  );
  run(
    process.execPath,
    [
      ...nodeOptions,
      "--input-type=module",
      "--eval",
      expression,
      JSON.stringify(targets),
    ],
    `native ${kind}${nodeOptions.length ? " with module detection disabled" : ""}`,
  );
}

if (process.argv.length !== 2) {
  fail(`unknown command-line option: ${process.argv.slice(2).join(" ")}`);
}

const packageJson = await readJson(
  path.join(packageDir, "package.json"),
  "built package manifest",
);
const sourcePackageJson = await readJson(
  path.join(repoRoot, "packages", "date-adapters", "package.json"),
  "source package manifest",
);
if (Object.hasOwn(packageJson, "saltSourceEntrypoints")) {
  fail("published metadata contains saltSourceEntrypoints.");
}
if (Object.hasOwn(packageJson, "scripts")) {
  fail("published metadata contains workspace scripts.");
}
if (
  JSON.stringify(packageJson.publishConfig) !==
  JSON.stringify({ provenance: true })
) {
  fail("published publishConfig must contain only provenance=true.");
}
for (const removedPeer of ["@types/react", "moment"]) {
  if (Object.hasOwn(packageJson.peerDependencies ?? {}, removedPeer)) {
    fail(`published metadata retains unrelated peer ${removedPeer}.`);
  }
}
const expectedOptionalPeers = [
  "@date-fns/tz",
  "@types/luxon",
  "date-fns",
  "dayjs",
  "luxon",
  "moment-timezone",
];
for (const peerName of expectedOptionalPeers) {
  if (typeof packageJson.peerDependencies?.[peerName] !== "string") {
    fail(`published metadata omits peer ${peerName}.`);
  }
  if (packageJson.peerDependenciesMeta?.[peerName]?.optional !== true) {
    fail(`published peer ${peerName} is not optional.`);
  }
}
if (!packageJson.exports || typeof packageJson.exports !== "object") {
  fail("published metadata has no exports map.");
}
if (
  !sourcePackageJson.saltSourceEntrypoints ||
  typeof sourcePackageJson.saltSourceEntrypoints !== "object" ||
  Array.isArray(sourcePackageJson.saltSourceEntrypoints)
) {
  fail("source metadata has no valid saltSourceEntrypoints map.");
}
const expectedExportPaths = Object.keys(
  sourcePackageJson.saltSourceEntrypoints,
).sort();
const publishedExportPaths = Object.keys(packageJson.exports).sort();
if (
  JSON.stringify(publishedExportPaths) !== JSON.stringify(expectedExportPaths)
) {
  fail("published export keys diverge from saltSourceEntrypoints.");
}

const targetPaths = [];
const runtimeImports = [];
const runtimeRequires = [];
for (const [exportPath, conditions] of Object.entries(packageJson.exports)) {
  if (!conditions || typeof conditions !== "object") {
    fail(`export ${exportPath} is not a conditional export object.`);
  }
  for (const condition of ["types", "import", "require"]) {
    const target = conditions[condition];
    if (typeof target !== "string" || !target.startsWith("./")) {
      fail(`export ${exportPath} has an invalid ${condition} target.`);
    }
    const relativeTarget = target.slice(2);
    const absoluteTarget = containedFile(
      relativeTarget,
      `${exportPath} ${condition} target`,
    );
    await requireRegularFile(
      absoluteTarget,
      `${exportPath} ${condition} target`,
    );
    targetPaths.push(relativeTarget);
    if (condition === "import") runtimeImports.push(absoluteTarget);
    if (condition === "require") runtimeRequires.push(absoluteTarget);
  }
}
const uniqueTargets = new Set(targetPaths);
if (uniqueTargets.size !== targetPaths.length) {
  fail("two export conditions resolve to the same target.");
}
const expectedTargetCount = expectedExportPaths.length * 3;
if (uniqueTargets.size !== expectedTargetCount) {
  fail(
    `expected ${expectedTargetCount} unique export targets, found ${uniqueTargets.size}.`,
  );
}

const esmMarker = await readJson(
  path.join(packageDir, "dist-es", "package.json"),
  "ESM format marker",
);
const cjsMarker = await readJson(
  path.join(packageDir, "dist-cjs", "package.json"),
  "CommonJS format marker",
);
if (esmMarker.type !== "module") fail("ESM marker is not type module.");
if (cjsMarker.type !== "commonjs")
  fail("CommonJS marker is not type commonjs.");

const [rootLicense, packedLicense] = await Promise.all([
  fs.readFile(path.join(repoRoot, "LICENSE")),
  fs.readFile(path.join(packageDir, "LICENSE")),
]);
if (!rootLicense.equals(packedLicense)) {
  fail("built LICENSE differs from the repository LICENSE.");
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
verifyNativeLoads("import", runtimeImports);
verifyNativeLoads("import", runtimeImports, [
  "--no-experimental-detect-module",
]);
verifyNativeLoads("require", runtimeRequires);

const verificationRoot = await fs.mkdtemp(
  path.join(os.tmpdir(), "salt-date-adapters-pack-"),
);
try {
  const packOutput = run(
    npmCommand,
    [
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      verificationRoot,
      packageDir,
    ],
    "npm pack",
  );
  let packResult;
  try {
    [packResult] = JSON.parse(packOutput);
  } catch (error) {
    fail(`npm pack returned invalid JSON (${error.message}).`);
  }
  if (
    !packResult ||
    !Array.isArray(packResult.files) ||
    typeof packResult.filename !== "string"
  ) {
    fail("npm pack did not report a file inventory and filename.");
  }
  const packedFiles = new Set(
    packResult.files.map(({ path: filePath }) => filePath),
  );
  for (const requiredFile of [...requiredPackedFiles, ...uniqueTargets]) {
    if (!packedFiles.has(requiredFile))
      fail(`packed output omits ${requiredFile}.`);
  }
  if (
    [...packedFiles].some(
      (filePath) => filePath === "src" || filePath.startsWith("src/"),
    )
  ) {
    fail("packed output contains source files.");
  }

  const tarballPath = path.join(verificationRoot, packResult.filename);
  await requireRegularFile(tarballPath, "packed tarball");
  const consumers = [
    { exportPath: ".", peerPackages: [] },
    { exportPath: "./date-fns", peerPackages: ["date-fns"] },
    {
      exportPath: "./date-fns-tz",
      peerPackages: ["@date-fns/tz", "date-fns"],
    },
    { exportPath: "./dayjs", peerPackages: ["dayjs"] },
    {
      exportPath: "./luxon",
      peerPackages: ["@types/luxon", "luxon"],
    },
    {
      exportPath: "./moment",
      peerPackages: ["moment", "moment-timezone"],
    },
  ];
  for (const consumer of consumers) {
    await verifyInstalledConsumer({
      ...consumer,
      tarballPath,
      verificationRoot,
    });
  }

  console.log(
    `Date Adapters package verified: ${packedFiles.size} packed files, ${uniqueTargets.size} export targets, LICENSE, module formats, and six isolated consumers valid.`,
  );
} finally {
  await fs.rm(verificationRoot, { recursive: true, force: true });
}
