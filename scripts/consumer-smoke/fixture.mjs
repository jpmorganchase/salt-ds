import fs from "node:fs/promises";
import path from "node:path";
import {
  assert,
  distCliDir,
  distMcpDir,
  getExecutable,
  pathExists,
  runCommand,
} from "./shared.mjs";

export async function ensureBuildArtifacts(skipBuild) {
  if (!skipBuild) {
    console.log("Building local MCP and CLI distributions...");
    await runCommand(
      getExecutable("yarn"),
      ["workspace", "@salt-ds/mcp", "build"],
      {
        label: "yarn workspace @salt-ds/mcp build",
      },
    );
    await runCommand(
      getExecutable("yarn"),
      ["workspace", "@salt-ds/cli", "build"],
      {
        label: "yarn workspace @salt-ds/cli build",
      },
    );
  }

  assert(
    await pathExists(distMcpDir),
    `Missing built MCP package at ${distMcpDir}. Run with --skip-build only after building it.`,
  );
  assert(
    await pathExists(distCliDir),
    `Missing built CLI package at ${distCliDir}. Run with --skip-build only after building it.`,
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

  console.log(
    "Installing built MCP and CLI packages into the temp smoke tools directory...",
  );
  await runCommand(
    getExecutable("npm"),
    ["install", "--no-package-lock", "--no-save", distMcpDir, distCliDir],
    {
      cwd: rootDir,
      label: "npm install local Salt MCP and CLI packages",
    },
  );
}

export async function verifySkills(rootDir, skillsSource) {
  console.log("Verifying skills source and isolated skill installation...");
  const expectedSkills = ["salt-ds"];
  const listResult = await runCommand(
    getExecutable("npx"),
    ["skills", "add", skillsSource, "--list"],
    {
      cwd: rootDir,
      label: "npx skills add --list",
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
      ["skills", "add", skillsSource, "--skill", skill, "--yes"],
      {
        cwd: rootDir,
        label: `npx skills add --skill ${skill}`,
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
