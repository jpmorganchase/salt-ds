import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import {
  assert,
  createMcpSurfaceFingerprint,
  createMcpToolSemanticFingerprint,
  distMcpDir,
  getExecutable,
  pathExists,
  REPLACE_PROCESS_ENVIRONMENT,
  repoRoot,
  runCommand,
} from "./shared.mjs";
import { hashCanonicalSkillTree } from "./skillTreeHash.mjs";

const offlineNetworkGuardUrl = pathToFileURL(
  path.join(repoRoot, "scripts", "consumer-smoke", "offline-network-guard.mjs"),
).href;

const FORBIDDEN_PRIVATE_DEPENDENCIES = ["@salt-ds/semantic-core"];
const FORBIDDEN_PACKED_MIGRATION_MARKERS = [
  "@modelcontextprotocol/" + "sdk",
  "@mcp-codemod-error",
  "zod-compat",
];
const STANDALONE_CONSUMER_FIXTURE_FILES = [
  ".github/copilot-instructions.md",
  ".salt/team.json",
  "AGENTS.md",
  "README.md",
  "docs/app-button.md",
  "docs/platform-conventions.md",
  "docs/token-aliases.md",
  "docs/workspace-shell.md",
  "mcp.config.example.json",
  "package.json",
  "src/components/AppButton.tsx",
  "src/env.d.ts",
  "src/theme/ConsumerBrandProvider.tsx",
  "src/theme/consumer-brand.css",
  "tsconfig.json",
  "yarn.lock",
];

function sha256Bytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function createIsolatedPackageManagerEnvironment(rootDir) {
  const cacheRoot = path.join(
    path.dirname(rootDir),
    `.${path.basename(rootDir)}-package-manager-state`,
  );
  const npmCache = path.join(cacheRoot, "npm");
  const yarnCache = path.join(cacheRoot, "yarn-cache");
  const yarnGlobal = path.join(cacheRoot, "yarn-global");
  const corepackHome = path.join(cacheRoot, "corepack");
  const npmPrefix = path.join(cacheRoot, "npm-prefix");
  const npmUserConfig = path.join(cacheRoot, "empty-user-npmrc");
  const npmGlobalConfig = path.join(cacheRoot, "empty-global-npmrc");
  const yarnConfigName = ".salt-consumer-smoke.yarnrc.yml";
  await Promise.all(
    [npmCache, yarnCache, yarnGlobal, corepackHome, npmPrefix].map(
      (directory) => fs.mkdir(directory, { recursive: true }),
    ),
  );
  await Promise.all([
    fs.writeFile(npmUserConfig, "", "utf8"),
    fs.writeFile(npmGlobalConfig, "", "utf8"),
    fs.writeFile(
      path.join(rootDir, yarnConfigName),
      [
        "enableGlobalCache: false",
        "enableTelemetry: false",
        "nodeLinker: node-modules",
        'npmRegistryServer: "https://registry.npmjs.org"',
        "",
      ].join("\n"),
      "utf8",
    ),
  ]);
  const environment = {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) =>
          !/^(?:COREPACK_|NPM_CONFIG_|YARN_|NODE_(?:OPTIONS|PATH|REPL_EXTERNAL_MODULE)$)/iu.test(
            key,
          ),
      ),
    ),
    COREPACK_HOME: corepackHome,
    NODE_PATH: "",
    NPM_CONFIG_CACHE: npmCache,
    NPM_CONFIG_GLOBALCONFIG: npmGlobalConfig,
    NPM_CONFIG_PREFIX: npmPrefix,
    NPM_CONFIG_REGISTRY: "https://registry.npmjs.org/",
    NPM_CONFIG_USERCONFIG: npmUserConfig,
    YARN_CACHE_FOLDER: yarnCache,
    YARN_ENABLE_GLOBAL_CACHE: "false",
    YARN_ENABLE_TELEMETRY: "0",
    YARN_GLOBAL_FOLDER: yarnGlobal,
    YARN_NODE_LINKER: "node-modules",
    YARN_NPM_REGISTRY_SERVER: "https://registry.npmjs.org",
    YARN_RC_FILENAME: yarnConfigName,
  };
  Object.defineProperty(environment, REPLACE_PROCESS_ENVIRONMENT, {
    value: true,
  });
  return environment;
}

async function hashExactDirectoryTree(rootDir) {
  const records = [];
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      const stats = await fs.lstat(absolutePath);
      assert(
        !stats.isSymbolicLink(),
        `Package tree contains a link: ${absolutePath}`,
      );
      if (stats.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      assert(
        stats.isFile(),
        `Package tree contains a special file: ${absolutePath}`,
      );
      const bytes = await fs.readFile(absolutePath);
      records.push({
        path: path.relative(rootDir, absolutePath).replaceAll("\\", "/"),
        bytes: bytes.byteLength,
        sha256: sha256Bytes(bytes),
      });
    }
  }
  await walk(rootDir);
  assert(records.length > 0, `Package tree is empty: ${rootDir}`);
  return sha256Bytes(Buffer.from(JSON.stringify(records), "utf8"));
}

async function reserveLocalPort() {
  return await new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else if (port === null)
          reject(new Error("Could not reserve a local port."));
        else resolve(port);
      });
    });
  });
}

async function verifyIsolatedConsumerBrowserArtifact(
  targetRoot,
  packageManagerEnvironment,
) {
  const entrypointPath = path.join(
    targetRoot,
    "src",
    "phase5-browser-entry.tsx",
  );
  await fs.writeFile(
    path.join(targetRoot, "index.html"),
    '<!doctype html><html lang="en"><head><title>Consumer artifact</title></head><body tabindex="-1"><div id="root"></div><script type="module" src="/src/phase5-browser-entry.tsx"></script></body></html>\n',
    "utf8",
  );
  await fs.writeFile(
    entrypointPath,
    [
      'import { useState } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import { AppButton } from "./components/AppButton";',
      'import { ConsumerBrandProvider } from "./theme/ConsumerBrandProvider";',
      "",
      "function Artifact() {",
      "  const [clicked, setClicked] = useState(false);",
      "  return (",
      '    <ConsumerBrandProvider mode="light" density="medium">',
      "      <main>",
      "        <h1>Consumer artifact</h1>",
      "        <AppButton",
      '          data-clicked={clicked ? "true" : "false"}',
      "          onClick={() => setClicked(true)}",
      "        >",
      '          {clicked ? "Saved" : "Save"}',
      "        </AppButton>",
      "      </main>",
      "    </ConsumerBrandProvider>",
      "  );",
      "}",
      "",
      'createRoot(document.getElementById("root")!).render(<Artifact />);',
      "",
    ].join("\n"),
    "utf8",
  );
  const port = await reserveLocalPort();
  const viteCli = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(
    process.execPath,
    [viteCli, "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: targetRoot,
      env: packageManagerEnvironment,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput = `${serverOutput}${chunk}`.slice(-16_384);
  });
  server.stderr.on("data", (chunk) => {
    serverOutput = `${serverOutput}${chunk}`.slice(-16_384);
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    let readinessFailure = "no response";
    for (let attempt = 0; attempt < 120 && !ready; attempt += 1) {
      if (server.exitCode !== null) {
        throw new Error(`Isolated Vite server exited early:\n${serverOutput}`);
      }
      try {
        const response = await fetch(baseUrl, {
          signal: AbortSignal.timeout(1_000),
        });
        ready = response.ok;
        readinessFailure = `HTTP ${response.status}`;
        await response.body?.cancel();
      } catch (error) {
        readinessFailure =
          error instanceof Error ? error.message : String(error);
      }
      if (!ready) {
        await delay(250);
      }
    }
    assert(
      ready,
      `Isolated Vite server did not become ready (${readinessFailure}):\n${serverOutput}`,
    );
    await runCommand(
      getExecutable("yarn"),
      [
        "cypress",
        "run",
        "--e2e",
        "--browser",
        "chrome",
        "--headless",
        "--config-file",
        "scripts/consumer-smoke/phase5-cypress.config.mjs",
        "--config",
        `baseUrl=${baseUrl}`,
        "--spec",
        "scripts/consumer-smoke/phase5-consumer-artifact.cy.mjs",
      ],
      {
        cwd: repoRoot,
        env: packageManagerEnvironment,
        label: "isolated standalone consumer Cypress artifact verification",
      },
    );
  } finally {
    if (server.exitCode === null) {
      const closed = new Promise((resolve) => server.once("close", resolve));
      server.kill();
      const closedGracefully = await Promise.race([
        closed.then(() => true),
        delay(5_000).then(() => false),
      ]);
      if (!closedGracefully && server.exitCode === null) {
        const forced = server.kill("SIGKILL");
        const closedForcibly = await Promise.race([
          closed.then(() => true),
          delay(5_000).then(() => false),
        ]);
        assert(
          forced && closedForcibly,
          "Isolated Vite server did not terminate after a forced shutdown.",
        );
      }
      await delay(250);
    }
  }
}

export function parseNpmJsonOutput(output, label) {
  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(
      `${label} returned invalid JSON: ${error instanceof Error ? error.message : error}\nstdout:\n${output}`,
    );
  }
}

export async function ensureBuildArtifacts(skipBuild) {
  if (!skipBuild) {
    console.log("Building local MCP distribution...");
    await runCommand(
      getExecutable("yarn"),
      ["workspace", "@salt-ds/mcp", "build"],
      {
        label: "yarn workspace @salt-ds/mcp build",
      },
    );
  }

  assert(
    await pathExists(distMcpDir),
    `Missing built MCP package at ${distMcpDir}. Run with --skip-build only after building it.`,
  );
}

export async function createExistingSaltRepo(rootDir) {
  await fs.mkdir(path.join(rootDir, ".storybook"), { recursive: true });
  await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, ".salt", "team.json"),
    `${JSON.stringify(
      {
        contract: "project_conventions_v1",
        version: "1.0.0",
        project: "salt-consumer-smoke-existing",
        approved_wrappers: [],
        preferred_components: [],
        banned_choices: [],
        pattern_preferences: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    `${JSON.stringify(
      {
        name: "salt-consumer-smoke-existing",
        private: true,
        packageManager: "npm@10.9.2",
        dependencies: {
          "@salt-ds/core": "1.67.0",
          "@salt-ds/theme": "1.43.0",
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          storybook: "^10.0.0",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "src", "App.tsx"),
    [
      'import { Button } from "@salt-ds/core";',
      "",
      "export function App() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "src", "Clean.tsx"),
    [
      'import { Link } from "@salt-ds/core";',
      "",
      "export function Clean() {",
      '  return <Link href="/next">Go</Link>;',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );
}

export async function createNonSaltRepo(rootDir) {
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.mkdir(path.join(rootDir, "vendor", "external-ui"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    `${JSON.stringify(
      {
        name: "salt-consumer-smoke-non-salt",
        private: true,
        packageManager: "npm@10.9.2",
        dependencies: {
          "@example/external-ui": "file:./vendor/external-ui",
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "vendor", "external-ui", "package.json"),
    `${JSON.stringify(
      {
        name: "@example/external-ui",
        version: "1.0.0",
        main: "index.js",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "vendor", "external-ui", "index.js"),
    ["exports.Button = function Button() {", "  return null;", "};", ""].join(
      "\n",
    ),
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "src", "LegacyPage.tsx"),
    [
      'import { Button } from "@example/external-ui";',
      "",
      "export function LegacyPage() {",
      '  return <Button variant="contained">Save</Button>;',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );
}

export async function createNewProjectRepo(rootDir) {
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    `${JSON.stringify(
      {
        name: "salt-consumer-smoke-new-project",
        private: true,
        packageManager: "npm@10.9.2",
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          vite: "^7.1.0",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["src/*"],
          },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

export async function installLocalPackages(rootDir) {
  await fs.mkdir(rootDir, { recursive: true });
  const packageManagerEnvironment =
    await createIsolatedPackageManagerEnvironment(rootDir);
  const manifestPath = path.join(rootDir, "package.json");
  if (!(await pathExists(manifestPath))) {
    await fs.writeFile(
      manifestPath,
      `${JSON.stringify(
        {
          name: "salt-consumer-smoke-tools",
          private: true,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  const packedPackageDir = path.join(rootDir, "packed-package");
  await fs.mkdir(packedPackageDir, { recursive: true });

  console.log("Packing the built MCP package for isolated installation...");
  const packResult = await runCommand(
    getExecutable("npm"),
    ["pack", "--json", "--pack-destination", packedPackageDir, distMcpDir],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: "npm pack built Salt MCP package",
    },
  );
  const packMetadata = parseNpmJsonOutput(
    packResult.stdout,
    "npm pack built Salt MCP package",
  );
  const packedPackage = Array.isArray(packMetadata)
    ? packMetadata[0]
    : packMetadata;
  assert(
    packedPackage && typeof packedPackage.filename === "string",
    "npm pack did not report a tarball filename for the built Salt MCP package.",
  );
  const tarballPath = path.join(packedPackageDir, packedPackage.filename);
  assert(
    await pathExists(tarballPath),
    `npm pack did not create the expected Salt MCP tarball at ${tarballPath}.`,
  );

  console.log(
    "Installing the packed MCP tarball into the temp smoke tools directory...",
  );
  await runCommand(
    getExecutable("npm"),
    ["install", "--save-exact", "--no-audit", "--no-fund", tarballPath],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: "npm install packed Salt MCP tarball",
    },
  );
  const localLockfilePath = path.join(rootDir, "package-lock.json");
  const localLockfileSha256 = sha256Bytes(await fs.readFile(localLockfilePath));
  await fs.rm(path.join(rootDir, "node_modules"), {
    recursive: true,
    force: true,
  });
  await runCommand(
    getExecutable("npm"),
    ["ci", "--ignore-scripts", "--no-audit", "--no-fund"],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: "npm ci replay of packed Salt MCP dependency tree",
    },
  );
  assert(
    sha256Bytes(await fs.readFile(localLockfilePath)) === localLockfileSha256,
    "Local packed MCP npm ci replay changed package-lock.json.",
  );

  const installedPackageDir = path.join(
    rootDir,
    "node_modules",
    "@salt-ds",
    "mcp",
  );
  const installedManifestPath = path.join(installedPackageDir, "package.json");
  assert(
    await pathExists(installedManifestPath),
    `Expected installed MCP manifest at ${installedManifestPath}.`,
  );
  const installedPackageStats = await fs.lstat(installedPackageDir);
  assert(
    !installedPackageStats.isSymbolicLink(),
    "Packed Salt MCP installed as a link instead of an isolated package copy.",
  );
  const installedManifest = JSON.parse(
    await fs.readFile(installedManifestPath, "utf8"),
  );
  for (const dependencyName of FORBIDDEN_PRIVATE_DEPENDENCIES) {
    assert(
      !Object.hasOwn(installedManifest.dependencies ?? {}, dependencyName),
      `Packed Salt MCP still declares bundled private dependency ${dependencyName}.`,
    );
  }
  for (const relativePath of [
    "package.json",
    "dist-es/index.js",
    "dist-cjs/index.js",
    "dist-types/index.d.ts",
  ]) {
    const content = await fs.readFile(
      path.join(installedPackageDir, relativePath),
      "utf8",
    );
    for (const marker of FORBIDDEN_PACKED_MIGRATION_MARKERS) {
      assert(
        !content.includes(marker),
        `Packed MCP file ${relativePath} retained migration marker ${marker}.`,
      );
    }
  }

  console.log("Verifying the installed npm dependency tree...");
  const dependencyTreeResult = await runCommand(
    getExecutable("npm"),
    ["ls", "--all", "--json"],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: "npm ls installed Salt MCP dependency tree",
    },
  );
  const dependencyTree = parseNpmJsonOutput(
    dependencyTreeResult.stdout,
    "npm ls installed Salt MCP dependency tree",
  );
  assert(
    dependencyTree?.dependencies?.["@salt-ds/mcp"],
    "npm dependency tree did not include the installed @salt-ds/mcp package.",
  );
  assert(
    !Array.isArray(dependencyTree.problems) ||
      dependencyTree.problems.length === 0,
    `npm dependency tree reported problems: ${(dependencyTree.problems ?? []).join("; ")}`,
  );

  return {
    installedPackageDir,
    installedTreeSha256: await hashExactDirectoryTree(installedPackageDir),
    packMetadata: packedPackage,
    tarballPath,
    lockfileSha256: localLockfileSha256,
  };
}

export async function installPublishedPackage(
  rootDir,
  { mcpSpec, expectedVersion, expectedGitHead },
) {
  await fs.mkdir(rootDir, { recursive: true });
  const packageManagerEnvironment =
    await createIsolatedPackageManagerEnvironment(rootDir);
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    `${JSON.stringify(
      { name: "salt-published-consumer-smoke", private: true },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`Resolving immutable registry identity for ${mcpSpec}...`);
  const viewResult = await runCommand(
    getExecutable("npm"),
    ["view", mcpSpec, "version", "gitHead", "dist.integrity", "--json"],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: `npm view ${mcpSpec}`,
    },
  );
  const registry = parseNpmJsonOutput(viewResult.stdout, `npm view ${mcpSpec}`);
  assert(
    registry?.version === expectedVersion,
    `Registry version ${registry?.version ?? "<missing>"} did not match ${expectedVersion}.`,
  );
  assert(
    registry?.gitHead === expectedGitHead,
    `Registry gitHead ${registry?.gitHead ?? "<missing>"} did not match ${expectedGitHead}.`,
  );
  assert(
    typeof registry?.dist?.integrity === "string" &&
      registry.dist.integrity.length > 0,
    "Registry metadata did not include npm tarball integrity.",
  );

  console.log(`Installing ${mcpSpec} in a fresh consumer...`);
  await runCommand(
    getExecutable("npm"),
    [
      "install",
      "--package-lock",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      mcpSpec,
    ],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: `npm install ${mcpSpec}`,
    },
  );

  const installedPackageDir = path.join(
    rootDir,
    "node_modules",
    "@salt-ds",
    "mcp",
  );
  const installedManifest = JSON.parse(
    await fs.readFile(path.join(installedPackageDir, "package.json"), "utf8"),
  );
  const installedStats = await fs.lstat(installedPackageDir);
  assert(
    installedStats.isDirectory() && !installedStats.isSymbolicLink(),
    "Published MCP must install as an isolated directory, not a link.",
  );
  assert(
    installedManifest.name === "@salt-ds/mcp" &&
      installedManifest.version === expectedVersion,
    "Installed published MCP manifest did not match the requested exact identity.",
  );
  for (const dependencyName of FORBIDDEN_PRIVATE_DEPENDENCIES) {
    assert(
      !Object.hasOwn(installedManifest.dependencies ?? {}, dependencyName),
      `Published MCP declares bundled private dependency ${dependencyName}.`,
    );
  }

  const lockfile = JSON.parse(
    await fs.readFile(path.join(rootDir, "package-lock.json"), "utf8"),
  );
  const lockedPackage = lockfile?.packages?.["node_modules/@salt-ds/mcp"];
  assert(
    lockedPackage?.version === expectedVersion &&
      lockedPackage?.integrity === registry.dist.integrity,
    "Installed package-lock identity did not match the registry tarball integrity.",
  );
  const publishedLockfilePath = path.join(rootDir, "package-lock.json");
  const publishedLockfileSha256 = sha256Bytes(
    await fs.readFile(publishedLockfilePath),
  );
  await fs.rm(path.join(rootDir, "node_modules"), {
    recursive: true,
    force: true,
  });
  await runCommand(
    getExecutable("npm"),
    ["ci", "--ignore-scripts", "--no-audit", "--no-fund"],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: "npm ci replay of published Salt MCP dependency tree",
    },
  );
  assert(
    sha256Bytes(await fs.readFile(publishedLockfilePath)) ===
      publishedLockfileSha256,
    "Published MCP npm ci replay changed package-lock.json.",
  );

  const dependencyTreeResult = await runCommand(
    getExecutable("npm"),
    ["ls", "--all", "--json"],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: "npm ls published Salt MCP dependency tree",
    },
  );
  const dependencyTree = parseNpmJsonOutput(
    dependencyTreeResult.stdout,
    "npm ls published Salt MCP dependency tree",
  );
  assert(
    dependencyTree?.dependencies?.["@salt-ds/mcp"]?.version === expectedVersion,
    "Published dependency tree did not include the exact installed MCP version.",
  );
  assert(
    !Array.isArray(dependencyTree.problems) ||
      dependencyTree.problems.length === 0,
    `Published dependency tree reported problems: ${(dependencyTree.problems ?? []).join("; ")}`,
  );

  return {
    npmName: installedManifest.name,
    version: installedManifest.version,
    gitHead: registry.gitHead,
    integrity: registry.dist.integrity,
    installedTreeSha256: await hashExactDirectoryTree(installedPackageDir),
  };
}

export async function verifyInstalledMcpTypes(rootDir) {
  const sourcePath = path.join(rootDir, "mcp-type-consumer.mts");
  const tsconfigPath = path.join(rootDir, "tsconfig.typecheck.json");
  const typescriptCliPath = path.join(
    repoRoot,
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );

  assert(
    await pathExists(typescriptCliPath),
    `Missing repo TypeScript compiler at ${typescriptCliPath}.`,
  );

  await fs.writeFile(
    sourcePath,
    [
      'import { createSaltMcpServer, runCli } from "@salt-ds/mcp";',
      'import type { CreateSaltMcpServerOptions } from "@salt-ds/mcp";',
      "",
      "const options: CreateSaltMcpServerOptions = {",
      '  registryDir: "./registry",',
      "};",
      "const server = await createSaltMcpServer(options);",
      "const cli: (argv?: string[]) => Promise<void> = runCli;",
      "",
      "await server.close();",
      "void cli;",
      "",
    ].join("\n"),
    "utf8",
  );
  await fs.writeFile(
    tsconfigPath,
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          types: [],
        },
        files: [path.basename(sourcePath)],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("Type-checking the installed MCP public declarations...");
  await runCommand(
    process.execPath,
    [typescriptCliPath, "--project", tsconfigPath],
    {
      cwd: rootDir,
      label: "TypeScript isolated MCP declaration check",
    },
  );
}

export async function verifyPackedReadmeLocalLinks(installedPackageDir) {
  const readmePath = path.join(installedPackageDir, "README.md");
  const readme = await fs.readFile(readmePath, "utf8");
  const links = [...readme.matchAll(/\]\(([^)]+)\)/gu)].map(
    (match) => match[1],
  );
  let localTargetsVerified = 0;
  let externalUrlsNotFetched = 0;
  for (const link of links) {
    if (/^(?:https?:|mailto:)/iu.test(link)) {
      externalUrlsNotFetched += 1;
      continue;
    }
    if (link.startsWith("#")) continue;
    assert(
      !/^[a-z][a-z0-9+.-]*:/iu.test(link),
      `Packed README link uses an unsupported URI scheme: ${link}`,
    );
    const target = path.resolve(
      installedPackageDir,
      decodeURIComponent(link.split("#", 1)[0]),
    );
    const relative = path.relative(installedPackageDir, target);
    assert(
      relative === "" ||
        (!relative.startsWith(`..${path.sep}`) &&
          relative !== ".." &&
          !path.isAbsolute(relative)),
      `Packed README link escapes the installed package: ${link}`,
    );
    assert(
      await pathExists(target),
      `Packed README link does not exist in the installed package: ${link}`,
    );
    localTargetsVerified += 1;
  }
  assert(
    localTargetsVerified > 0,
    "Packed README must link to at least one package-local target.",
  );
  return {
    local_targets_verified: localTargetsVerified,
    external_urls_not_fetched: externalUrlsNotFetched,
  };
}

export async function verifyInstalledMcpModuleExports(rootDir, projectRoot) {
  const probePath = path.join(
    repoRoot,
    "scripts",
    "consumer-smoke",
    "installed-mcp-module-probe.mjs",
  );
  const probeEnvironment =
    await createIsolatedPackageManagerEnvironment(rootDir);
  const result = await runCommand(
    process.execPath,
    [probePath, rootDir, projectRoot],
    {
      env: probeEnvironment,
      label: "isolated installed MCP module probe",
    },
  );
  const receiptPrefix = "SALT_CONSUMER_MODULE_PROBE_RECEIPT=";
  const receiptLines = result.stdout
    .split(/\r?\n/u)
    .filter((line) => line.startsWith(receiptPrefix));
  assert(
    receiptLines.length === 1,
    `Installed MCP module probe returned ${receiptLines.length} receipts.`,
  );
  return JSON.parse(receiptLines[0].slice(receiptPrefix.length));
}

export async function runInstalledMcpModuleProbe(rootDir, projectRoot) {
  const assertions = [
    'typeof mod.createSaltMcpServer === "function"',
    'typeof mod.runCli === "function"',
    '!("TOOL_DEFINITIONS" in mod)',
  ];
  const failure =
    'throw new Error("Installed @salt-ds/mcp export contract is incomplete")';

  console.log("Loading installed MCP through ESM and CommonJS exports...");
  await runCommand(
    process.execPath,
    [
      "--import",
      offlineNetworkGuardUrl,
      "--input-type=module",
      "--eval",
      `const mod = await import("@salt-ds/mcp"); if (!(${assertions.join(" && ")})) ${failure};`,
    ],
    { cwd: rootDir, label: "installed MCP ESM export check" },
  );
  await runCommand(
    process.execPath,
    [
      "--import",
      offlineNetworkGuardUrl,
      "--input-type=commonjs",
      "--eval",
      `const mod = require("@salt-ds/mcp"); if (!(${assertions.join(" && ")})) ${failure};`,
    ],
    { cwd: rootDir, label: "installed MCP CommonJS export check" },
  );

  const installedPackageDir = path.join(
    rootDir,
    "node_modules",
    "@salt-ds",
    "mcp",
  );
  const readmeLinks = await verifyPackedReadmeLocalLinks(installedPackageDir);
  console.log(
    `Verified ${readmeLinks.local_targets_verified} package-local README target(s); ${readmeLinks.external_urls_not_fetched} external URL(s) were not fetched.`,
  );
  const require = createRequire(import.meta.url);
  await import(offlineNetworkGuardUrl);
  const moduleFormats = [
    [
      "ESM",
      await import(
        pathToFileURL(path.join(installedPackageDir, "dist-es", "index.js"))
          .href
      ),
    ],
    [
      "CommonJS",
      require(path.join(installedPackageDir, "dist-cjs", "index.js")),
    ],
  ];
  let esmResourceUris = null;
  let esmFingerprint = null;
  let esmToolFingerprint = null;

  for (const [format, mcpModule] of moduleFormats) {
    const server = await mcpModule.createSaltMcpServer({
      projectAccess: {
        mode: "restricted",
        allowedRoots: [projectRoot],
        defaultRoot: projectRoot,
      },
    });
    const client = new Client({
      name: `salt-packed-${format.toLowerCase()}-probe`,
      version: "1.0.0",
    });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    try {
      const tools = await client.listTools();
      const toolNames = tools.tools.map((tool) => tool.name);
      assert(
        JSON.stringify(toolNames) ===
          JSON.stringify([
            "search_salt",
            "inspect_salt_project",
            "review_salt_code",
          ]),
        `Installed MCP ${format} factory exposed an unexpected tool surface.`,
      );
      const firstPage = await client.request({
        method: "resources/list",
        params: {},
      });
      assert(
        firstPage.resources.length > 1 &&
          typeof firstPage.nextCursor === "string",
        `Installed MCP ${format} factory did not expose cursor-paginated resources.`,
      );
      const resources = await client.listResources();
      const resourceUris = resources.resources.map((resource) => resource.uri);
      assert(
        new Set(resourceUris).size === resourceUris.length,
        `Installed MCP ${format} factory exposed duplicate resources.`,
      );
      const manifestResult = await client.readResource({
        uri: resourceUris[0],
      });
      const manifest = JSON.parse(manifestResult.contents[0].text);
      const templates = await client.listResourceTemplates();
      const catalogTemplate = templates.resourceTemplates.find((template) =>
        /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/\{family\}\/\{id\}$/u.test(
          template.uriTemplate,
        ),
      );
      assert(
        templates.resourceTemplates.length === 2 &&
          catalogTemplate &&
          templates.resourceTemplates.some(
            (template) =>
              template.uriTemplate ===
              "salt://project-policy/v2/{root}/{digest}/{kind}/{id}",
          ),
        `Installed MCP ${format} factory exposed an unexpected resource template surface.`,
      );
      const expectedResourceCount =
        1 +
        manifest.families.reduce(
          (total, family) => total + family.record_count,
          0,
        );
      assert(
        resourceUris.length === expectedResourceCount,
        `Installed MCP ${format} factory listed ${resourceUris.length}/${expectedResourceCount} exact resources.`,
      );
      const fingerprint = createMcpSurfaceFingerprint({
        client,
        toolNames,
        manifestUri: resourceUris[0],
        manifest,
        resourceCount: resourceUris.length,
        resourceTemplate: catalogTemplate.uriTemplate,
      });
      const toolFingerprint = await createMcpToolSemanticFingerprint(
        client,
        projectRoot,
      );
      if (format === "ESM") {
        esmResourceUris = resourceUris;
        esmFingerprint = fingerprint;
        esmToolFingerprint = toolFingerprint;
        for (let offset = 0; offset < resourceUris.length; offset += 64) {
          await Promise.all(
            resourceUris
              .slice(offset, offset + 64)
              .map((uri) => client.readResource({ uri })),
          );
        }
      } else {
        assert(
          JSON.stringify(resourceUris) === JSON.stringify(esmResourceUris),
          "Installed MCP CommonJS resources differ from the ESM resource surface.",
        );
        assert(
          JSON.stringify(fingerprint) === JSON.stringify(esmFingerprint),
          "Installed MCP CommonJS protocol fingerprint differs from ESM.",
        );
        assert(
          JSON.stringify(toolFingerprint) ===
            JSON.stringify(esmToolFingerprint),
          "Installed MCP CommonJS tool semantics differ from ESM.",
        );
        for (const family of manifest.families) {
          const prefix = family.uri_template.slice(0, -"{id}".length);
          const representative = resourceUris.find((uri) =>
            uri.startsWith(prefix),
          );
          assert(
            representative,
            `Installed MCP ${format} factory omitted ${family.family}.`,
          );
          await client.readResource({ uri: representative });
        }
      }

      for (const request of [
        {
          name: "search_salt",
          arguments: { query: "Button", families: ["component"], limit: 1 },
        },
        {
          name: "inspect_salt_project",
          arguments: { root_dir: rootDir, include_policy_ir: false },
        },
        {
          name: "review_salt_code",
          arguments: {
            artifacts: [
              {
                id: "probe.tsx",
                language: "tsx",
                text: "export const Probe = () => <button>Probe</button>;",
              },
            ],
          },
        },
      ]) {
        const result = await client.callTool(request);
        assert(
          result.isError !== true,
          `Installed MCP ${format} factory failed ${request.name}.`,
        );
      }
    } finally {
      await client.close();
      await server.close();
    }
  }
  return { surface: esmFingerprint, tools: esmToolFingerprint };
}

export async function verifySkills(rootDir, skillsSource, expectedTreeHash) {
  console.log("Verifying skills source and isolated skill installation...");
  const packageManagerEnvironment =
    await createIsolatedPackageManagerEnvironment(rootDir);
  const expectedSkills = ["salt-ds"];
  // Keep the release gate deterministic; update this deliberately after
  // verifying compatibility with a newer Skills CLI.
  const skillsCliPackage = "skills@1.5.16";
  const listResult = await runCommand(
    getExecutable("npx"),
    [skillsCliPackage, "add", skillsSource, "--list"],
    {
      cwd: rootDir,
      env: packageManagerEnvironment,
      label: `npx ${skillsCliPackage} add --list`,
    },
  );
  const combinedListOutput = `${listResult.stdout}\n${listResult.stderr}`;
  for (const skill of expectedSkills) {
    assert(
      combinedListOutput.includes(skill),
      `Skills list output did not include ${skill}.`,
    );

    await runCommand(
      getExecutable("npx"),
      [skillsCliPackage, "add", skillsSource, "--skill", skill, "--yes"],
      {
        cwd: rootDir,
        env: packageManagerEnvironment,
        label: `npx ${skillsCliPackage} add --skill ${skill}`,
      },
    );

    const installedSkillPath = path.join(
      rootDir,
      ".agents",
      "skills",
      skill,
      "SKILL.md",
    );
    assert(
      await pathExists(installedSkillPath),
      `Expected installed skill at ${installedSkillPath}.`,
    );

    const installedSkillRoot = path.dirname(installedSkillPath);
    const installedHash = await hashCanonicalSkillTree(installedSkillRoot);
    const sourceIsRemote = /^https:\/\//u.test(skillsSource);
    const sourceHash = sourceIsRemote
      ? null
      : await hashCanonicalSkillTree(path.join(skillsSource, skill));
    const requiredHash = expectedTreeHash ?? sourceHash?.sha256;
    assert(
      requiredHash && installedHash.sha256 === requiredHash,
      `Installed ${skill} tree hash ${installedHash.sha256} did not match ${requiredHash ?? "<missing expected hash>"}.`,
    );
  }
}

export async function verifyStandaloneConsumerExample(
  tempRoot,
  mcpSpec,
  { expectedPackageTreeSha256 = null, expectedVersion = null } = {},
) {
  const sourceRoot = path.join(repoRoot, "workflow-examples", "consumer-repo");
  const targetRoot = path.join(tempRoot, "standalone-consumer-example");
  await fs.mkdir(targetRoot, { recursive: true });
  for (const relativePath of STANDALONE_CONSUMER_FIXTURE_FILES) {
    const sourcePath = path.join(sourceRoot, ...relativePath.split("/"));
    const stats = await fs.lstat(sourcePath);
    assert(
      stats.isFile() && !stats.isSymbolicLink(),
      `Standalone example contains a link: ${sourcePath}`,
    );
    const targetPath = path.join(targetRoot, ...relativePath.split("/"));
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }

  const hashFile = async (filePath) =>
    createHash("sha256")
      .update(await fs.readFile(filePath))
      .digest("hex");
  let installSpec = mcpSpec;
  let localTarballSha256 = null;
  if (path.isAbsolute(mcpSpec) && (await pathExists(mcpSpec))) {
    const localTarballName = path.basename(mcpSpec);
    const copiedTarballPath = path.join(targetRoot, localTarballName);
    await fs.copyFile(mcpSpec, copiedTarballPath, fs.constants.COPYFILE_EXCL);
    localTarballSha256 = await hashFile(mcpSpec);
    assert(
      (await hashFile(copiedTarballPath)) === localTarballSha256,
      "Standalone exact tarball changed while copying into the isolated consumer.",
    );
    installSpec = `@salt-ds/mcp@file:./${localTarballName}`;
  }

  const targetRootStats = await fs.lstat(targetRoot);
  assert(
    targetRootStats.isDirectory() && !targetRootStats.isSymbolicLink(),
    "Standalone example target is not an isolated directory.",
  );

  const yarnEnvironment =
    await createIsolatedPackageManagerEnvironment(targetRoot);
  console.log("Installing the standalone consumer example immutably...");
  await runCommand(
    getExecutable("corepack"),
    ["yarn", "install", "--immutable"],
    {
      cwd: targetRoot,
      env: yarnEnvironment,
      label: "standalone corepack yarn install --immutable",
    },
  );
  console.log(
    `Installing ${installSpec} for the standalone MCP configuration...`,
  );
  await runCommand(
    getExecutable("corepack"),
    ["yarn", "add", "--mode=skip-build", "--exact", installSpec],
    {
      cwd: targetRoot,
      env: yarnEnvironment,
      label: `standalone corepack yarn add ${installSpec}`,
    },
  );
  const packageJsonPath = path.join(targetRoot, "package.json");
  const lockfilePath = path.join(targetRoot, "yarn.lock");
  const replayIdentity = {
    package_json_sha256: await hashFile(packageJsonPath),
    yarn_lock_sha256: await hashFile(lockfilePath),
  };
  await fs.rm(path.join(targetRoot, "node_modules"), {
    recursive: true,
    force: true,
  });
  await runCommand(
    getExecutable("corepack"),
    ["yarn", "install", "--immutable"],
    {
      cwd: targetRoot,
      env: yarnEnvironment,
      label: "standalone immutable replay after exact MCP install",
    },
  );
  assert(
    replayIdentity.package_json_sha256 === (await hashFile(packageJsonPath)) &&
      replayIdentity.yarn_lock_sha256 === (await hashFile(lockfilePath)),
    "Standalone exact-package replay changed package.json or yarn.lock during immutable verification.",
  );
  const installedPackagePath = path.join(
    targetRoot,
    "node_modules",
    "@salt-ds",
    "mcp",
  );
  const installedPackageStats = await fs.lstat(installedPackagePath);
  assert(
    installedPackageStats.isDirectory() &&
      !installedPackageStats.isSymbolicLink(),
    "Standalone exact-package replay installed @salt-ds/mcp as a link.",
  );
  const installedPackage = JSON.parse(
    await fs.readFile(path.join(installedPackagePath, "package.json"), "utf8"),
  );
  assert(
    installedPackage.name === "@salt-ds/mcp" &&
      (expectedVersion === null ||
        installedPackage.version === expectedVersion),
    "Standalone exact-package replay installed the wrong package identity or version.",
  );
  const installedPackageTreeSha256 =
    await hashExactDirectoryTree(installedPackagePath);
  assert(
    expectedPackageTreeSha256 === null ||
      installedPackageTreeSha256 === expectedPackageTreeSha256,
    "Standalone Yarn replay package bytes differ from the npm-verified package tree.",
  );
  if (localTarballSha256 !== null) {
    const lockContent = await fs.readFile(lockfilePath, "utf8");
    const descriptor = installSpec.slice("@salt-ds/mcp@".length);
    const entryStart = lockContent.indexOf(`"@salt-ds/mcp@${descriptor}`);
    const entryEnd =
      entryStart === -1 ? -1 : lockContent.indexOf('\n"', entryStart + 1);
    const lockEntry =
      entryStart === -1
        ? ""
        : lockContent.slice(
            entryStart,
            entryEnd === -1 ? lockContent.length : entryEnd,
          );
    assert(
      lockEntry.includes(`resolution: "@salt-ds/mcp@${descriptor}`) &&
        /\n\s+checksum:\s+\S+/u.test(lockEntry),
      "Standalone Yarn lock is not bound to the exact local tarball and checksum.",
    );
  }
  const mcpConfig = JSON.parse(
    await fs.readFile(path.join(targetRoot, "mcp.config.example.json"), "utf8"),
  );
  const configuredEntrypoint = mcpConfig?.mcpServers?.Salt?.args?.[0];
  assert(
    typeof configuredEntrypoint === "string" &&
      (await pathExists(path.resolve(targetRoot, configuredEntrypoint))),
    "Standalone example MCP configuration did not resolve to the installed binary.",
  );
  console.log("Running the standalone consumer example verification...");
  await runCommand(getExecutable("corepack"), ["yarn", "ui:verify"], {
    cwd: targetRoot,
    env: yarnEnvironment,
    label: "standalone corepack yarn ui:verify",
  });
  console.log(
    "Running isolated standalone consumer render, interaction, and accessibility verification...",
  );
  await verifyIsolatedConsumerBrowserArtifact(targetRoot, yarnEnvironment);
  return {
    install_spec: installSpec,
    local_tarball_sha256: localTarballSha256,
    installed_version: installedPackage.version,
    installed_package_tree_sha256: installedPackageTreeSha256,
    replay_identity: replayIdentity,
  };
}
