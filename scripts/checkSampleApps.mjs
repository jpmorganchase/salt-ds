import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appsRoot = path.join(repositoryRoot, "examples", "apps");
const appNames = ["vite-starter", "next-app-router", "operations-dashboard"];
const keepTemp = process.argv.includes("--keep-temp");
const saltPackages = new Map([
  ["@salt-ds/core", "salt-ds-core"],
  ["@salt-ds/icons", "salt-ds-icons"],
  ["@salt-ds/styles", "salt-ds-styles"],
  ["@salt-ds/theme", "salt-ds-theme"],
  ["@salt-ds/window", "salt-ds-window"],
]);
const executable = (name) => (process.platform === "win32" ? `${name}.cmd` : name);

async function run(command, args, options = {}) {
  const result = await execa(executable(command), args, {
    cwd: options.cwd ?? repositoryRoot,
    env: options.env,
    reject: false,
    stdio: "inherit",
  });
  assert.equal(result.exitCode, 0, `${options.label ?? command} failed`);
}

async function verifyPublicSource(appName) {
  const appRoot = path.join(appsRoot, appName);
  const manifest = JSON.parse(await readFile(path.join(appRoot, "package.json"), "utf8"));
  assert.equal(manifest.private, true, `${appName} must be a non-publishable application`);
  for (const [dependency, distName] of saltPackages) {
    if (!manifest.dependencies?.[dependency]) continue;
    const sourceManifest = JSON.parse(
      await readFile(path.join(repositoryRoot, "packages", distName.replace("salt-ds-", ""), "package.json"), "utf8"),
    );
    assert.equal(manifest.dependencies[dependency], sourceManifest.version, `${appName} must declare the current ${dependency} cohort version`);
  }

  const pending = [appRoot];
  const sourceFiles = [];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      else if (/\.(?:css|js|jsx|json|md|ts|tsx)$/.test(entry.name)) sourceFiles.push(absolute);
    }
  }
  for (const file of sourceFiles) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /(?:storybook\.saltdesignsystem\.com|@storybook\/|@salt-ds\/mcp|(?:^|["'])\.\.\/.*packages\/|workspace:|file:)/imu, `${path.relative(repositoryRoot, file)} contains a repository-only or unreleased dependency`);
  }
  const mainSources = sourceFiles.filter((file) => /\.(?:ts|tsx)$/.test(file)).map((file) => readFile(file, "utf8"));
  const combined = (await Promise.all(mainSources)).join("\n");
  assert.match(combined, /SaltProviderNext/);
  assert.match(combined, /@salt-ds\/theme\/css\/global\.css/);
  assert.match(combined, /@salt-ds\/theme\/css\/theme-next\.css/);
}

async function packSaltPackages(tempRoot) {
  const packedRoot = path.join(tempRoot, "packs");
  await mkdir(packedRoot, { recursive: true });
  const tarballs = new Map();
  for (const [packageName, distName] of saltPackages) {
    const distRoot = path.join(repositoryRoot, "dist", distName);
    const manifest = JSON.parse(await readFile(path.join(distRoot, "package.json"), "utf8"));
    const sourceDir = manifest.repository.directory;
    assert.ok(await readFile(path.join(distRoot, "README.md"), "utf8"), `${packageName} packed README is missing`);
    const sourceManifest = JSON.parse(await readFile(path.join(repositoryRoot, sourceDir, "package.json"), "utf8"));
    assert.equal(manifest.version, sourceManifest.version, `${packageName} build output is stale`);
    const result = await execa(executable("npm"), ["pack", "--json", "--pack-destination", packedRoot, distRoot], { cwd: tempRoot });
    const metadata = JSON.parse(result.stdout)[0];
    assert.ok(metadata.files.some(({ path: file }) => file === "README.md"), `${packageName} pack omits README.md`);
    tarballs.set(packageName, path.join(packedRoot, metadata.filename));
  }
  return tarballs;
}

async function prepareWorkspace(tempRoot, tarballs) {
  const tempAppsRoot = path.join(tempRoot, "apps");
  await mkdir(tempAppsRoot, { recursive: true });
  for (const appName of appNames) {
    const target = path.join(tempAppsRoot, appName);
    await cp(path.join(appsRoot, appName), target, { recursive: true });
    const manifestPath = path.join(target, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    for (const [packageName, tarball] of tarballs) {
      manifest.dependencies[packageName] = `file:${tarball.replaceAll("\\", "/")}`;
    }
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  await writeFile(
    path.join(tempRoot, "package.json"),
    `${JSON.stringify({ name: "salt-sample-app-validation", private: true, workspaces: ["apps/*"] }, null, 2)}\n`,
  );
  await run("npm", ["install", "--no-audit", "--no-fund"], { cwd: tempRoot, label: "sample app dependency install" });
  return tempAppsRoot;
}

async function waitForServer(url, processHandle) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== undefined) {
      throw new Error(`Server exited before ${url} became ready`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function runBrowserChecks(tempRoot, appName, port) {
  const appRoot = path.join(tempRoot, "apps", appName);
  const isNext = appName === "next-app-router";
  const cli = path.join(
    tempRoot,
    "node_modules",
    ...(isNext
      ? ["next", "dist", "bin", "next"]
      : ["vite", "bin", "vite.js"]),
  );
  const args = isNext
    ? [cli, "start", "-p", String(port), "-H", "127.0.0.1"]
    : [cli, "preview", "--host", "127.0.0.1", "--port", String(port)];
  const server = execa(process.execPath, args, { cwd: appRoot, reject: false });
  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(url, server);
    await run(
      "yarn",
      [
        "cypress",
        "run",
        "--browser",
        "electron",
        "--config-file",
        "examples/apps/cypress.config.ts",
        "--config",
        `baseUrl=${url}`,
        "--spec",
        `examples/apps/${appName}/cypress/app.cy.ts`,
      ],
      { label: `${appName} interaction and axe checks` },
    );
  } finally {
    server.kill("SIGTERM");
    await server.catch(() => undefined);
  }
}

for (const appName of appNames) await verifyPublicSource(appName);

const tempRoot = await mkdtemp(path.join(tmpdir(), "salt-sample-apps-"));
console.log(`Using temporary sample-app workspace: ${tempRoot}`);
try {
  const tarballs = await packSaltPackages(tempRoot);
  await prepareWorkspace(tempRoot, tarballs);
  for (const appName of appNames) {
    await run("npm", ["run", "typecheck"], { cwd: path.join(tempRoot, "apps", appName), label: `${appName} typecheck` });
    await run("npm", ["run", "build"], { cwd: path.join(tempRoot, "apps", appName), label: `${appName} production build` });
  }
  if (!process.argv.includes("--skip-browser")) {
    for (const [index, appName] of appNames.entries()) await runBrowserChecks(tempRoot, appName, 4310 + index);
  }
  console.log(`Verified ${appNames.length} standalone Salt applications against locally packed packages.`);
} finally {
  if (!keepTemp) {
    await rm(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 500,
    });
  }
}
