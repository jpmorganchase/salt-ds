import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import { execa } from "execa";
import { chromium } from "playwright";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const appsRoot = path.join(repositoryRoot, "examples", "apps");
const knownApps = ["vite-starter", "next-app-router", "operations-dashboard"];
const toolingPackages = ["@salt-ds/cli", "@salt-ds/knowledge"];
const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;
const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const executable = (name) =>
  process.platform === "win32" ? `${name}.cmd` : name;
const nodeRequire = createRequire(import.meta.url);

function parseArgs(arguments_) {
  const values = new Map();
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    assert.equal(argument, "--app", `Unknown option: ${argument}`);
    assert(!values.has(argument), `${argument} may be provided only once`);
    const value = arguments_[index + 1];
    assert(value && !value.startsWith("--"), `${argument} requires a value`);
    values.set(argument, value);
    index += 1;
  }
  return values;
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function pathExists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function portable(relative) {
  const normalized = relative.replaceAll("\\", "/");
  assert(
    normalized.length > 0 &&
      !path.isAbsolute(normalized) &&
      !normalized
        .split("/")
        .some((segment) => ["", ".", ".."].includes(segment)),
    `Unsafe repository-relative path: ${relative}`,
  );
  return normalized;
}

function inside(parent, child, label) {
  const relative = path.relative(parent, child);
  assert(
    relative !== "" &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative),
    `${label} escapes ${parent}`,
  );
  return child;
}

async function repositoryCommit() {
  const dotGit = path.join(repositoryRoot, ".git");
  const dotGitStat = await stat(dotGit);
  let gitDirectory = dotGit;
  if (dotGitStat.isFile()) {
    const pointer = (await readFile(dotGit, "utf8")).trim();
    assert(pointer.startsWith("gitdir: "), "Unsupported .git pointer");
    gitDirectory = path.resolve(
      repositoryRoot,
      pointer.slice("gitdir: ".length),
    );
  }
  const head = (await readFile(path.join(gitDirectory, "HEAD"), "utf8")).trim();
  if (/^[0-9a-f]{40}$/u.test(head)) return head;
  assert(head.startsWith("ref: "), "Unsupported Git HEAD");
  const reference = portable(head.slice("ref: ".length));
  const looseReference = path.join(gitDirectory, ...reference.split("/"));
  if (await pathExists(looseReference)) {
    const commit = (await readFile(looseReference, "utf8")).trim();
    assert(/^[0-9a-f]{40}$/u.test(commit), "Loose Git reference is invalid");
    return commit;
  }
  const packedReferences = await readFile(
    path.join(gitDirectory, "packed-refs"),
    "utf8",
  );
  const match = packedReferences
    .split(/\r?\n/u)
    .find((line) => line.endsWith(` ${reference}`));
  assert(match, `Git reference ${reference} is unavailable`);
  const [commit] = match.split(" ");
  assert(/^[0-9a-f]{40}$/u.test(commit), "Packed Git reference is invalid");
  return commit;
}

async function run(command, arguments_, options = {}) {
  const capture = options.capture === true;
  const result = await execa(command, arguments_, {
    cwd: options.cwd ?? repositoryRoot,
    env: options.env,
    reject: false,
    stdout: capture ? "pipe" : "inherit",
    stderr: capture ? "pipe" : "inherit",
  });
  if (result.exitCode !== (options.expectedExitCode ?? 0)) {
    if (capture) {
      if (result.stdout) process.stderr.write(`${result.stdout}\n`);
      if (result.stderr) process.stderr.write(`${result.stderr}\n`);
    }
    assert.equal(
      result.exitCode,
      options.expectedExitCode ?? 0,
      `${options.label ?? command} failed`,
    );
  }
  return result;
}

async function packageRegistry() {
  const registry = new Map();
  const packagesRoot = path.join(repositoryRoot, "packages");
  for (const entry of await readdir(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(packagesRoot, entry.name);
    const manifestPath = path.join(packageRoot, "package.json");
    if (!(await pathExists(manifestPath))) continue;
    const manifestBytes = await readFile(manifestPath);
    const manifest = JSON.parse(manifestBytes.toString("utf8"));
    if (
      typeof manifest.name !== "string" ||
      !manifest.name.startsWith("@salt-ds/")
    ) {
      continue;
    }
    assert(!registry.has(manifest.name), `Duplicate package ${manifest.name}`);
    assert(
      typeof manifest.publishConfig?.directory === "string",
      `${manifest.name} has no publish directory`,
    );
    const distributionRoot = path.resolve(
      packageRoot,
      manifest.publishConfig.directory,
    );
    inside(
      path.join(repositoryRoot, "dist"),
      distributionRoot,
      `${manifest.name} publish directory`,
    );
    registry.set(manifest.name, {
      manifest,
      manifestBytes,
      manifestPath,
      packageRoot,
      distributionRoot,
    });
  }
  return registry;
}

function firstPartyDependencies(manifest, registry) {
  return ["dependencies", "optionalDependencies", "peerDependencies"]
    .flatMap((field) => Object.keys(manifest[field] ?? {}))
    .filter((name) => registry.has(name))
    .toSorted();
}

async function sourceFiles(root) {
  const pending = [root];
  const files = [];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        assert.notEqual(
          entry.name,
          "node_modules",
          "Source app contains node_modules",
        );
        pending.push(absolute);
      } else if (
        /\.(?:css|html|js|jsx|json|md|mjs|ts|tsx)$/u.test(entry.name)
      ) {
        files.push(absolute);
      }
    }
  }
  return files.toSorted();
}

async function verifyPublicApp(appName, registry, compatibility) {
  const appRoot = path.join(appsRoot, appName);
  const manifestPath = path.join(appRoot, "package.json");
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  assert.equal(manifest.private, true, `${appName} must remain private`);
  assert.equal(manifest.version, "0.0.0", `${appName} fixture version drifted`);
  assert(
    !manifest.dependencies?.["@salt-ds/mcp"],
    `${appName} cannot require MCP`,
  );

  const directSalt = Object.keys(manifest.dependencies ?? {})
    .filter((name) => name.startsWith("@salt-ds/"))
    .toSorted();
  assert(directSalt.length > 0, `${appName} has no direct Salt dependencies`);
  for (const name of directSalt) {
    const candidate = registry.get(name);
    assert(candidate, `${appName} references unknown package ${name}`);
    const declared = manifest.dependencies[name];
    assert(
      exactVersionPattern.test(declared),
      `${appName} must exact-pin ${name}`,
    );
    assert.equal(
      declared,
      candidate.manifest.version,
      `${appName} ${name} version differs from the candidate cohort`,
    );
    const tested = compatibility.get(name);
    assert(tested, `${name} is absent from Knowledge compatibility`);
    assert.equal(
      declared,
      tested,
      `${appName} ${name} differs from the Knowledge tested vector`,
    );
  }

  const files = await sourceFiles(appRoot);
  const sources = await Promise.all(
    files.map((file) => readFile(file, "utf8")),
  );
  const combined = sources.join("\n");
  assert.doesNotMatch(
    combined,
    /(?:storybook\.saltdesignsystem\.com|@storybook\/|@salt-ds\/mcp|workspace:|(?:^|["'])file:|(?:^|["'])\.\.\/.*packages\/)/imu,
    `${appName} contains a repository-only or unreleased dependency`,
  );
  assert.doesNotMatch(
    combined,
    /(?:[A-Za-z]:\\Users\\|\/Users\/[^/]+\/|\/home\/[^/]+\/)/u,
    `${appName} contains an absolute local path`,
  );
  assert.match(
    combined,
    /SaltProviderNext/u,
    `${appName} omits SaltProviderNext`,
  );
  assert.match(
    combined,
    /@salt-ds\/theme\/css\/global\.css/u,
    `${appName} omits Salt global CSS`,
  );
  assert.match(
    combined,
    /@salt-ds\/theme\/css\/theme-next\.css/u,
    `${appName} omits the current theme CSS`,
  );
  assert.match(
    combined,
    /<FormFieldLabel/u,
    `${appName} omits a labelled form`,
  );
  assert.match(combined, /<nav|<Navigation/u, `${appName} omits navigation`);
  assert.match(combined, /<Dialog/u, `${appName} omits an overlay flow`);
  assert.match(combined, /density/u, `${appName} omits density behavior`);
  assert.match(combined, /mode/u, `${appName} omits color-mode behavior`);

  const readme = await readFile(path.join(appRoot, "README.md"), "utf8");
  for (const required of [
    "salt-ds info",
    "salt-ds docs",
    "salt-ds context",
    "salt-ds scan",
    "skill print",
    "AGENTS.md",
    "Storybook",
    "MCP",
  ]) {
    assert(readme.includes(required), `${appName} README omits ${required}`);
  }
  const browserTest = await readFile(
    path.join(appRoot, "cypress", "app.cy.ts"),
    "utf8",
  );
  assert.match(browserTest, /checkA11y/u, `${appName} omits axe coverage`);
  assert.match(
    browserTest,
    /have\.focus/u,
    `${appName} omits authored keyboard focus coverage`,
  );

  return { appRoot, manifest, manifestBytes, directSalt };
}

function discoverCohort(apps, registry) {
  const usedBy = new Map();
  const directBy = new Map();
  const addUsage = (packageName, appName) => {
    if (!usedBy.has(packageName)) usedBy.set(packageName, new Set());
    usedBy.get(packageName).add(appName);
  };
  for (const app of apps) {
    const direct = new Set(app.directSalt);
    directBy.set(app.name, direct);
    const pending = [...direct];
    const visited = new Set();
    while (pending.length > 0) {
      const packageName = pending.shift();
      if (visited.has(packageName)) continue;
      visited.add(packageName);
      addUsage(packageName, app.name);
      const candidate = registry.get(packageName);
      assert(candidate, `Unknown first-party dependency ${packageName}`);
      for (const dependency of firstPartyDependencies(
        candidate.manifest,
        registry,
      )) {
        pending.push(dependency);
      }
    }
    for (const packageName of toolingPackages) addUsage(packageName, app.name);
  }

  const pendingTools = [...toolingPackages];
  while (pendingTools.length > 0) {
    const packageName = pendingTools.shift();
    const candidate = registry.get(packageName);
    assert(candidate, `Missing required tooling package ${packageName}`);
    for (const dependency of firstPartyDependencies(
      candidate.manifest,
      registry,
    )) {
      for (const app of apps) addUsage(dependency, app.name);
      if (!usedBy.has(dependency)) pendingTools.push(dependency);
    }
  }

  return [...usedBy.keys()].toSorted().map((name) => {
    const roles = [];
    if (toolingPackages.includes(name)) roles.push("tooling");
    if (apps.some((app) => directBy.get(app.name).has(name)))
      roles.push("direct");
    if (
      apps.some(
        (app) =>
          usedBy.get(name).has(app.name) && !directBy.get(app.name).has(name),
      )
    ) {
      roles.push("transitive");
    }
    return {
      name,
      candidate: registry.get(name),
      roles,
      usedBy: [...usedBy.get(name)].toSorted(),
    };
  });
}

async function packCohort(cohort, artifactRoot, receiptKey, compatibility) {
  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(artifactRoot, { recursive: true });
  const packed = [];
  for (const entry of cohort) {
    const distributionManifestPath = path.join(
      entry.candidate.distributionRoot,
      "package.json",
    );
    const distributionManifestBytes = await readFile(distributionManifestPath);
    const distributionManifest = JSON.parse(
      distributionManifestBytes.toString("utf8"),
    );
    assert.equal(
      distributionManifest.name,
      entry.name,
      `${entry.name} distribution name is stale`,
    );
    assert.equal(
      distributionManifest.version,
      entry.candidate.manifest.version,
      `${entry.name} distribution version is stale; run yarn build`,
    );
    assert(
      await pathExists(
        path.join(entry.candidate.distributionRoot, "README.md"),
      ),
      `${entry.name} distribution README is missing`,
    );
    if (!toolingPackages.includes(entry.name)) {
      assert.equal(
        compatibility.get(entry.name),
        entry.candidate.manifest.version,
        `${entry.name} differs from the tested Knowledge vector`,
      );
    }

    const pack = await run(
      executable("npm"),
      [
        "pack",
        "--json",
        "--pack-destination",
        artifactRoot,
        entry.candidate.distributionRoot,
      ],
      { capture: true, label: `${entry.name} candidate pack` },
    );
    const metadata = JSON.parse(pack.stdout);
    assert.equal(
      metadata.length,
      1,
      `${entry.name} produced multiple tarballs`,
    );
    const [result] = metadata;
    assert.equal(
      result.name,
      entry.name,
      `${entry.name} npm pack name mismatch`,
    );
    assert.equal(
      result.version,
      entry.candidate.manifest.version,
      `${entry.name} npm pack version mismatch`,
    );
    assert(
      result.files.some((file) => file.path === "README.md"),
      `${entry.name} tarball omits README.md`,
    );
    const tarballPath = path.join(artifactRoot, result.filename);
    const tarballBytes = await readFile(tarballPath);
    const relativeTarball = portable(
      path.relative(repositoryRoot, tarballPath),
    );
    assert(
      relativeTarball.startsWith(
        `dist/salt-sample-apps/${receiptKey}.artifacts/`,
      ),
      `${entry.name} tarball escaped its artifact directory`,
    );
    assert(/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(result.integrity));
    packed.push({
      ...entry,
      distributionManifest,
      filename: result.filename,
      tarballPath,
      receipt: {
        name: entry.name,
        version: entry.candidate.manifest.version,
        roles: entry.roles,
        used_by: entry.usedBy,
        source_manifest_sha256: sha256(entry.candidate.manifestBytes),
        packed_manifest_sha256: sha256(distributionManifestBytes),
        tarball: {
          path: relativeTarball,
          sha256: sha256(tarballBytes),
          integrity: result.integrity,
          bytes: tarballBytes.byteLength,
          files: result.files.length,
        },
      },
    });
  }
  return packed;
}

function offlineEnvironment() {
  const guard = path
    .join(repositoryRoot, "scripts", "saltSampleAppOfflineGuard.cjs")
    .replaceAll("\\", "/");
  const existing = process.env.NODE_OPTIONS?.trim();
  return {
    ...process.env,
    NODE_OPTIONS: [existing, `--require=${guard}`].filter(Boolean).join(" "),
    SALT_SAMPLE_APP_OFFLINE_GUARD: "1",
    NO_PROXY: "127.0.0.1,localhost,::1",
    no_proxy: "127.0.0.1,localhost,::1",
    CYPRESS_DISABLE_CRASH_REPORTS: "1",
  };
}

async function verifyNegativeNetworkFixture(environment) {
  const result = await execa(
    process.execPath,
    [
      path.join(
        repositoryRoot,
        "scripts",
        "fixtures",
        "salt-sample-apps",
        "network-attempt.mjs",
      ),
    ],
    { cwd: repositoryRoot, env: environment, reject: false },
  );
  assert.notEqual(
    result.exitCode,
    0,
    "Offline hostile fixture reached the network",
  );
  assert(
    `${result.stdout}\n${result.stderr}`.includes(
      "SALT_SAMPLE_APP_NETWORK_BLOCKED",
    ),
    "Offline hostile fixture failed for the wrong reason",
  );
}

function lockPackageName(lockPath) {
  const match = lockPath.match(/(?:^|\/)node_modules\/(@salt-ds\/[^/]+)$/u);
  return match?.[1] ?? null;
}

async function verifyInstalledCohort(appRoot, packed, lockfile) {
  const expected = new Map(packed.map((entry) => [entry.name, entry]));
  const observed = new Set();
  let workspaceLinks = 0;
  let registryFallbacks = 0;
  for (const [lockPath, entry] of Object.entries(lockfile.packages ?? {})) {
    const packageName = lockPackageName(lockPath.replaceAll("\\", "/"));
    if (!packageName) continue;
    observed.add(packageName);
    const expectedPackage = expected.get(packageName);
    assert(expectedPackage, `Lockfile reached unexpected ${packageName}`);
    if (entry.link === true) workspaceLinks += 1;
    if (
      typeof entry.resolved !== "string" ||
      !entry.resolved.startsWith("file:")
    ) {
      registryFallbacks += 1;
    } else {
      assert.equal(
        entry.integrity,
        expectedPackage.receipt.tarball.integrity,
        `${packageName} lock integrity mismatch`,
      );
    }
  }
  assert.deepEqual(
    [...observed].toSorted(),
    [...expected.keys()].toSorted(),
    "Lockfile Salt cohort is incomplete",
  );
  assert.equal(workspaceLinks, 0, "Lockfile contains a Salt workspace link");
  assert.equal(
    registryFallbacks,
    0,
    "Lockfile resolved a Salt package from the registry",
  );

  const lockSource = JSON.stringify(lockfile);
  assert.doesNotMatch(
    lockSource,
    /registry\.npmjs\.org\/(?:%40|@)salt-ds/iu,
    "Lockfile contains a Salt registry fallback",
  );
  const nodeModulesRoot = path.join(appRoot, "node_modules");
  const physicalRoot = await realpath(nodeModulesRoot);
  for (const entry of packed) {
    const installedRoot = path.join(nodeModulesRoot, ...entry.name.split("/"));
    const installedStat = await lstat(installedRoot);
    assert(
      !installedStat.isSymbolicLink(),
      `${entry.name} is a workspace link`,
    );
    const installedRealPath = await realpath(installedRoot);
    inside(physicalRoot, installedRealPath, `${entry.name} installation`);
    const installedManifest = await readJson(
      path.join(installedRoot, "package.json"),
    );
    assert.equal(
      installedManifest.version,
      entry.candidate.manifest.version,
      `${entry.name} installed version mismatch`,
    );
  }
  return { workspaceLinks, registryFallbacks };
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object", "Failed to reserve a port");
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

async function waitForServer(url, server) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== undefined) {
      const result = await server;
      throw new Error(
        `Server exited before ${url} became ready:\n${result.stdout ?? ""}\n${
          result.stderr ?? ""
        }`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function browserChecks(appName, appRoot, environment) {
  const port = await availablePort();
  const next = appName === "next-app-router";
  const cli = next
    ? path.join(appRoot, "node_modules", "next", "dist", "bin", "next")
    : path.join(appRoot, "node_modules", "vite", "bin", "vite.js");
  const arguments_ = next
    ? [cli, "start", "-p", String(port), "-H", "127.0.0.1"]
    : [cli, "preview", "--host", "127.0.0.1", "--port", String(port)];
  const server = execa(process.execPath, arguments_, {
    cwd: appRoot,
    env: environment,
    reject: false,
  });
  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(url, server);
    if (next) {
      const html = await (await fetch(url)).text();
      assert.match(
        html,
        /Request workspace access/u,
        "Next initial HTML omits Salt UI",
      );
      assert.match(
        html,
        /salt-density-/u,
        "Next initial HTML omits theme state",
      );
    }
    const browser = await chromium.launch({
      channel: "chrome",
      headless: true,
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
      });
      const runtimeErrors = [];
      const externalRequests = [];
      page.on("console", (message) => {
        if (message.type() === "error") runtimeErrors.push(message.text());
      });
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      await page.route("**/*", async (route) => {
        const requestUrl = new URL(route.request().url());
        if (
          ["data:", "blob:"].includes(requestUrl.protocol) ||
          ["127.0.0.1", "::1", "localhost"].includes(requestUrl.hostname)
        ) {
          await route.continue();
          return;
        }
        externalRequests.push(requestUrl.href);
        await route.abort("blockedbyclient");
      });
      await page.goto(url, { waitUntil: "networkidle" });

      if (appName === "vite-starter") {
        await page.getByRole("heading", { name: "Create a project" }).waitFor();
        const mode = page.getByTestId("mode-toggle");
        await mode.focus();
        assert(
          await mode.evaluate((element) => element === document.activeElement),
        );
        await mode.click();
        assert.equal(
          await page.locator(".appShell").getAttribute("data-mode"),
          "dark",
        );

        const density = page.getByTestId("density-toggle");
        await density.focus();
        assert(
          await density.evaluate(
            (element) => element === document.activeElement,
          ),
        );
        await density.click();
        assert.equal(
          await page.locator(".appShell").getAttribute("data-density"),
          "high",
        );

        await page.getByRole("button", { name: "Preview launch" }).click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "detached" });
        assert.equal(await dialog.count(), 0);

        await page.getByLabel("Project name").fill("Market insights");
        await page.getByLabel("Owner email").fill("owner@example.com");
        await page.getByRole("button", { name: "Save project" }).click();
        await page.getByRole("status").waitFor();
        assert.match(await page.getByRole("status").innerText(), /saved/u);

        await page.setViewportSize({ width: 600, height: 800 });
        await page
          .getByRole("navigation", { name: "Primary navigation" })
          .waitFor();
      }

      const axeEntry = nodeRequire.resolve("axe-core");
      const axeSource = await readFile(
        path.join(path.dirname(axeEntry), "axe.min.js"),
        "utf8",
      );
      await page.addScriptTag({ content: axeSource });
      const accessibility = await page.evaluate(() => globalThis.axe.run());
      assert.deepEqual(
        accessibility.violations,
        [],
        `${appName} has axe violations`,
      );
      assert.deepEqual(
        externalRequests,
        [],
        `${appName} attempted external requests`,
      );
      assert.deepEqual(runtimeErrors, [], `${appName} emitted browser errors`);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
    await server.catch(() => undefined);
  }
}

async function scanApp(appRoot, environment) {
  const cli = path.join(
    appRoot,
    "node_modules",
    "@salt-ds",
    "cli",
    "bin",
    "salt-ds.js",
  );
  const result = await run(
    process.execPath,
    [
      cli,
      "scan",
      ".",
      "--format",
      "json",
      "--fail-on",
      "warning",
      "--allow-incomplete",
    ],
    {
      cwd: appRoot,
      env: environment,
      capture: true,
      label: "packed salt-ds scan",
    },
  );
  const scan = JSON.parse(result.stdout);
  assert.equal(scan.contract, "salt-scan-result/1");
  assert.notEqual(scan.coverage.status, "failed", "Sample app scan failed");
  assert(
    scan.coverage.reasons.every(
      (reason) => reason === "SCAN_UNSUPPORTED_CONSTRUCT",
    ),
    `Sample app scan has an unexpected limitation: ${scan.coverage.reasons.join(
      ", ",
    )}`,
  );
  assert.equal(scan.summary.errors, 0, "Sample app scan found errors");
  assert.equal(scan.summary.warnings, 0, "Sample app scan found warnings");
  assert.equal(scan.summary.total, 0, "Sample app scan is not clean");
  return {
    result: "pass",
    coverage: scan.coverage.status,
    allow_incomplete: true,
    reasons: scan.coverage.reasons,
    errors: scan.summary.errors,
    warnings: scan.summary.warnings,
    findings: scan.summary.total,
  };
}

async function validateReceipt(receipt) {
  const schema = await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltSampleAppCohortReceiptV1.schema.json",
    ),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  assert(
    validate(receipt),
    `Sample app receipt schema failure: ${ajv.errorsText(validate.errors, {
      separator: "; ",
    })}`,
  );
}

const args = parseArgs(process.argv.slice(2));
const selectedApp = args.get("--app");
assert(
  selectedApp === undefined || knownApps.includes(selectedApp),
  `Unknown sample app: ${selectedApp}`,
);
const selectedNames = selectedApp ? [selectedApp] : knownApps;
const receiptKey = selectedApp ?? "all";
const outputRoot = path.join(repositoryRoot, "dist", "salt-sample-apps");
const artifactRoot = path.join(outputRoot, `${receiptKey}.artifacts`);
const receiptPath = path.join(outputRoot, `${receiptKey}-cohort-receipt.json`);
inside(outputRoot, artifactRoot, "Sample app artifact directory");
inside(outputRoot, receiptPath, "Sample app receipt path");
await mkdir(outputRoot, { recursive: true });
await rm(receiptPath, { force: true });

const knowledgeManifest = await readJson(
  path.join(repositoryRoot, "dist", "salt-ds-knowledge", "manifest.json"),
);
assert(digestPattern.test(knowledgeManifest.bundle_digest));
assert(digestPattern.test(knowledgeManifest.semantic_digest));
const compatibility = new Map(
  knowledgeManifest.compatibility.packages.map((entry) => [
    entry.name,
    entry.tested_version,
  ]),
);
const registry = await packageRegistry();
const sourceSnapshots = new Map();
const apps = [];
for (const name of selectedNames) {
  const verified = await verifyPublicApp(name, registry, compatibility);
  const lockfilePath = path.join(verified.appRoot, "package-lock.json");
  sourceSnapshots.set(
    path.join(verified.appRoot, "package.json"),
    verified.manifestBytes,
  );
  sourceSnapshots.set(
    lockfilePath,
    (await pathExists(lockfilePath)) ? await readFile(lockfilePath) : null,
  );
  apps.push({ name, ...verified });
}

const cohort = discoverCohort(apps, registry);
const packed = await packCohort(
  cohort,
  artifactRoot,
  receiptKey,
  compatibility,
);
const tempRoot = await mkdtemp(path.join(tmpdir(), "salt-sample-apps-"));
console.log(`Using isolated sample-app workspace: ${tempRoot}`);
const appReceipts = [];
const lockReceipts = [];
const checks = [];
const environment = offlineEnvironment();
try {
  const tempPacks = path.join(tempRoot, "packs");
  await mkdir(tempPacks, { recursive: true });
  for (const entry of packed) {
    await cp(entry.tarballPath, path.join(tempPacks, entry.filename));
  }

  let hostileFixtureVerified = false;
  for (const app of apps) {
    const isolatedRoot = path.join(tempRoot, app.name);
    await cp(app.appRoot, isolatedRoot, { recursive: true });
    const isolatedManifestPath = path.join(isolatedRoot, "package.json");
    const isolatedManifest = await readJson(isolatedManifestPath);
    isolatedManifest.dependencies ??= {};
    isolatedManifest.devDependencies ??= {};
    for (const entry of packed) {
      const target = Object.hasOwn(isolatedManifest.dependencies, entry.name)
        ? isolatedManifest.dependencies
        : isolatedManifest.devDependencies;
      target[entry.name] = `file:../packs/${entry.filename}`;
    }
    const isolatedManifestBytes = Buffer.from(
      `${JSON.stringify(isolatedManifest, null, 2)}\n`,
    );
    await writeFile(isolatedManifestPath, isolatedManifestBytes);

    await run(
      executable("npm"),
      [
        "install",
        "--package-lock-only",
        "--no-audit",
        "--no-fund",
        "--prefer-offline",
      ],
      { cwd: isolatedRoot, label: `${app.name} lockfile generation` },
    );
    const lockfilePath = path.join(isolatedRoot, "package-lock.json");
    const generatedLockfileBytes = await readFile(lockfilePath);
    await run(executable("npm"), ["ci", "--no-audit", "--no-fund"], {
      cwd: isolatedRoot,
      label: `${app.name} lockfile replay`,
    });
    const replayedLockfileBytes = await readFile(lockfilePath);
    assert(
      replayedLockfileBytes.equals(generatedLockfileBytes),
      `${app.name} lockfile changed during replay`,
    );
    assert(
      (await readFile(isolatedManifestPath)).equals(isolatedManifestBytes),
      `${app.name} isolated manifest changed during install`,
    );
    const lockfile = JSON.parse(replayedLockfileBytes.toString("utf8"));
    await verifyInstalledCohort(isolatedRoot, packed, lockfile);
    await writeFile(isolatedManifestPath, app.manifestBytes);

    if (!hostileFixtureVerified) {
      await verifyNegativeNetworkFixture(environment);
      hostileFixtureVerified = true;
    }
    await run(executable("npm"), ["run", "typecheck"], {
      cwd: isolatedRoot,
      env: environment,
      label: `${app.name} typecheck`,
    });
    await run(executable("npm"), ["run", "build"], {
      cwd: isolatedRoot,
      env: environment,
      label: `${app.name} production build`,
    });
    const scan = await scanApp(isolatedRoot, environment);
    await browserChecks(app.name, isolatedRoot, environment);

    appReceipts.push({
      name: app.name,
      path: `examples/apps/${app.name}`,
      manifest_sha256: sha256(app.manifestBytes),
      isolated_manifest_sha256: sha256(isolatedManifestBytes),
    });
    lockReceipts.push({
      app: app.name,
      sha256: sha256(replayedLockfileBytes),
      replay: "unchanged",
    });
    checks.push({
      app: app.name,
      build: "pass",
      typecheck: "pass",
      interaction: "pass",
      a11y: "pass",
      keyboard: "pass",
      scan,
    });
  }

  for (const [file, before] of sourceSnapshots) {
    if (before === null) {
      assert(
        !(await pathExists(file)),
        `${file} was created in the source app`,
      );
    } else {
      assert(
        (await readFile(file)).equals(before),
        `${file} changed during validation`,
      );
    }
  }

  const receipt = {
    $schema:
      "https://www.saltdesignsystem.com/ai/schemas/salt-sample-app-cohort-receipt-1.json",
    schema_version: "1.0.0",
    contract: "salt-sample-app-cohort-receipt/1",
    source_commit: await repositoryCommit(),
    apps: appReceipts.toSorted((left, right) =>
      left.name.localeCompare(right.name),
    ),
    knowledge_bundle: {
      version: knowledgeManifest.bundle_version,
      bundle_digest: knowledgeManifest.bundle_digest,
      semantic_digest: knowledgeManifest.semantic_digest,
      semantic_source_digest: knowledgeManifest.semantic_source_digest,
      compiler_digest: knowledgeManifest.compiler_digest,
    },
    packages: packed.map((entry) => entry.receipt),
    install: {
      package_manager: "npm",
      lockfiles: lockReceipts.toSorted((left, right) =>
        left.app.localeCompare(right.app),
      ),
      source_manifests_unchanged: true,
      source_lockfiles_unchanged: true,
      workspace_links: 0,
      first_party_registry_fallbacks: 0,
      physical_first_party_packages: packed.length,
    },
    offline_guard: {
      status: "pass",
      phase: "post-install",
      allowed_hosts: ["127.0.0.1", "::1", "localhost"],
      negative_fixture: {
        target: "https://example.invalid/salt-sample-app-offline-guard",
        result: "blocked",
      },
    },
    checks: checks.toSorted((left, right) => left.app.localeCompare(right.app)),
  };
  await validateReceipt(receipt);
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    flag: "wx",
  });
  console.log(
    `Verified ${selectedNames.join(", ")} against ${packed.length} exact local Salt tarballs.`,
  );
  console.log(
    `Wrote ${portable(path.relative(repositoryRoot, receiptPath))} (${sha256(
      await readFile(receiptPath),
    )}).`,
  );
} finally {
  await rm(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 500,
  });
}
