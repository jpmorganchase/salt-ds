import fs from "node:fs/promises";
import path from "node:path";
import {
  assert,
  distMcpDir,
  getExecutable,
  pathExists,
  repoRoot,
  runCommand,
} from "./shared.mjs";

const FORBIDDEN_PRIVATE_DEPENDENCIES = ["@salt-ds/semantic-core"];

function parseNpmJsonOutput(output, label) {
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
          "@salt-ds/core": "^0.0.0-smoke",
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
    [
      "install",
      "--no-package-lock",
      "--save-exact",
      "--no-audit",
      "--no-fund",
      tarballPath,
    ],
    {
      cwd: rootDir,
      label: "npm install packed Salt MCP tarball",
    },
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

  console.log("Verifying the installed npm dependency tree...");
  const dependencyTreeResult = await runCommand(
    getExecutable("npm"),
    ["ls", "--all", "--json"],
    {
      cwd: rootDir,
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
      '  siteBaseUrl: "https://www.saltdesignsystem.com",',
      "};",
      "const server = createSaltMcpServer(options);",
      "const cli: (argv?: string[]) => Promise<void> = runCli;",
      "",
      "void server;",
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

export async function verifyInstalledMcpModuleExports(rootDir) {
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
      "--input-type=module",
      "--eval",
      `const mod = await import("@salt-ds/mcp"); if (!(${assertions.join(" && ")})) ${failure};`,
    ],
    { cwd: rootDir, label: "installed MCP ESM export check" },
  );
  await runCommand(
    process.execPath,
    [
      "--input-type=commonjs",
      "--eval",
      `const mod = require("@salt-ds/mcp"); if (!(${assertions.join(" && ")})) ${failure};`,
    ],
    { cwd: rootDir, label: "installed MCP CommonJS export check" },
  );
}

export async function verifySkills(rootDir, skillsSource) {
  console.log("Verifying skills source and isolated skill installation...");
  const expectedSkills = ["salt-ds"];
  // Keep the release gate deterministic; update this deliberately after
  // verifying compatibility with a newer Skills CLI.
  const skillsCliPackage = "skills@1.5.16";
  const listResult = await runCommand(
    getExecutable("npx"),
    [skillsCliPackage, "add", skillsSource, "--list"],
    {
      cwd: rootDir,
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
  }
}
