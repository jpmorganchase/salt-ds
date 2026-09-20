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
import {
  assertPackedWorkflowManifestMatchesSource,
  readPackedWorkflowRecipe,
  retainViteWorkflowPreview,
  selectSampleAppNames,
  unavailableAnalysis,
  verifyCurrentCliCommands,
} from "./checkSaltSampleAppsHelpers.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const appsRoot = path.join(repositoryRoot, "examples", "apps");
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
    stripFinalNewline: false,
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

async function projectTreeDigest(root) {
  const hash = createHash("sha256");
  const pending = [root];
  const files = [];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules") continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  for (const file of files.toSorted()) {
    hash.update(portable(path.relative(root, file)));
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
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

  if (appName === "operations-dashboard") {
    assert(
      directSalt.includes("@salt-ds/lab"),
      "Operations dashboard must consume the exact Lab candidate",
    );
    assert.match(
      combined,
      /from ["']@salt-ds\/lab["']/u,
      "Operations dashboard omits a public Lab component",
    );
    const [reusableWorklist, dashboardHost] = await Promise.all([
      readFile(
        path.join(
          appRoot,
          "src",
          "workflows",
          "service-worklist",
          "IncidentWorklist.tsx",
        ),
        "utf8",
      ),
      readFile(path.join(appRoot, "src", "OperationsDashboard.tsx"), "utf8"),
    ]);
    for (const localDemoControl of ["Show empty state", "Restore worklist"]) {
      assert(
        !reusableWorklist.includes(localDemoControl),
        `Reusable worklist embeds host-only control: ${localDemoControl}`,
      );
      assert(
        dashboardHost.includes(localDemoControl),
        `Operations dashboard host omits local control: ${localDemoControl}`,
      );
    }
  }

  if (appName === "next-app-router") {
    const clientBoundaries = [];
    for (const file of files) {
      const source = await readFile(file, "utf8");
      if (/^\s*["']use client["'];/u.test(source)) {
        clientBoundaries.push(portable(path.relative(appRoot, file)));
      }
    }
    assert.deepEqual(
      clientBoundaries,
      ["app/RequestAccess.tsx", "app/providers.tsx"],
      "Next client boundaries must stay minimal and explicit",
    );
  }

  const readme = await readFile(path.join(appRoot, "README.md"), "utf8");
  for (const required of [
    "salt-ds info",
    "salt-ds docs",
    "salt-ds context",
    "skill print",
    "AGENTS.md",
    "Storybook",
    "MCP",
  ]) {
    assert(readme.includes(required), `${appName} README omits ${required}`);
  }
  assert.doesNotMatch(
    readme,
    /salt-ds scan/u,
    `${appName} README advertises the removed scan command`,
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

async function assertNoAxeViolations(page, label) {
  // Measure the settled UI, not an intermediate frame of a modal fade.
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getTiming().iterations !==
            Number.POSITIVE_INFINITY,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  const accessibility = await page.evaluate(() => globalThis.axe.run());
  assert.deepEqual(accessibility.violations, [], `${label} has axe violations`);
}

async function assertServiceWorklistReady(page) {
  await page.getByText("Showing 4 of 4 services", { exact: true }).waitFor();

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await navigation.waitFor();
  const services = navigation.getByRole("link", { name: "Services" });
  const incidents = navigation.getByRole("link", { name: "Incidents" });
  assert.equal(await services.getAttribute("href"), "#services");
  assert.equal(await services.getAttribute("aria-current"), "location");
  assert.equal(await incidents.getAttribute("href"), "#incidents");
  await incidents.click();
  await page.waitForFunction(
    () =>
      location.hash === "#incidents" &&
      document
        .querySelector('nav a[href="#incidents"]')
        ?.getAttribute("aria-current") === "location",
  );
  assert.equal(await incidents.getAttribute("aria-current"), "location");
  await page.getByRole("heading", { name: "Incident worklist" }).waitFor();
  await services.click();
  await page.waitForFunction(
    () =>
      location.hash === "#services" &&
      document
        .querySelector('nav a[href="#services"]')
        ?.getAttribute("aria-current") === "location",
  );
  assert.equal(await services.getAttribute("aria-current"), "location");

  const filter = page.getByLabel("Filter services");
  await filter.fill("risk");
  await page.getByText("Showing 1 of 4 services", { exact: true }).waitFor();
  await page.getByRole("row", { name: /Risk calculator/u }).waitFor();
  assert.equal(
    await page.getByRole("row", { name: /Order gateway/u }).count(),
    0,
  );

  await filter.fill("missing");
  await page
    .getByText(
      "No services match “missing”. Clear the filter or try another service.",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await page
      .getByText("There are no services available.", {
        exact: true,
      })
      .count(),
    0,
    "No-match state was presented as an empty data set",
  );
  await filter.fill("risk");
  await page.getByText("Showing 1 of 4 services", { exact: true }).waitFor();
}

async function assertServiceWorklistDetailAndRecovery(page) {
  const inspect = page.getByRole("button", { name: "Inspect Risk calculator" });
  await inspect.focus();
  assert(
    await inspect.evaluate((element) => element === document.activeElement),
    "Worklist inspect action could not receive focus",
  );
  await inspect.click();
  const details = page.getByRole("region", { name: "Incident details" });
  await details.waitFor();
  await details.getByRole("heading", { name: "Incident details" }).waitFor();
  assert.match(await details.innerText(), /Risk calculator latency/u);

  const edit = details.getByRole("button", { name: "Edit incident" });
  await edit.click();
  const editDialog = page.getByRole("dialog");
  await editDialog.waitFor();
  await editDialog.getByRole("heading", { name: "Edit incident" }).waitFor();
  assert.equal(
    await editDialog.locator('form[aria-label="Edit incident record"]').count(),
    1,
    "Edit dialog did not expose the RecordForm edit label",
  );
  const title = editDialog.getByLabel("Incident title");
  const service = editDialog.getByLabel(
    "Affected service or operational process",
  );
  assert.equal(await title.inputValue(), "Risk calculator latency");
  assert.equal(await service.inputValue(), "Risk calculator");
  await title.fill("Risk calculator latency escalated");
  await service.fill("Custom risk process");
  await editDialog.getByRole("button", { name: "Update incident" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Incident INC-1042 updated." })
    .waitFor({ timeout: 5_000 });
  await editDialog.waitFor({ state: "detached" });
  assert(
    await edit.evaluate((element) => element === document.activeElement),
    "Edit completion did not return focus to its trigger",
  );
  const updatedDetails = await details.innerText();
  assert.match(updatedDetails, /INC-1042/u);
  assert.match(updatedDetails, /Risk calculator latency escalated/u);
  assert.match(updatedDetails, /Custom risk process/u);
  const selectedIncident = page.getByRole("button", {
    name: "Inspect INC-1042: Risk calculator latency escalated",
    exact: true,
  });
  assert.equal(
    await selectedIncident.getAttribute("aria-pressed"),
    "true",
    "Editing a service outside the fixture list changed the selected incident",
  );

  const filter = page.getByLabel("Filter services");
  await filter.fill("");
  await page.getByText("Showing 4 of 4 services", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Refresh worklist" }).click();
  await page.getByText("Refreshing worklist.", { exact: true }).waitFor();
  const refreshFailure = page.getByRole("alert").filter({
    hasText:
      "The worklist refresh failed. The current services remain available.",
  });
  try {
    await refreshFailure.waitFor({ timeout: 5_000 });
  } catch (error) {
    if ((await refreshFailure.count()) === 0) {
      throw new Error(
        "Service worklist did not expose its deterministic first refresh failure",
        { cause: error },
      );
    }
    throw error;
  }
  await page.getByText("Showing 4 of 4 services", { exact: true }).waitFor();
  await page.getByRole("row", { name: /Risk calculator/u }).waitFor();
  await page.getByRole("button", { name: "Retry worklist refresh" }).click();
  await page
    .getByText("Worklist refreshed. Showing 4 of 4 services.", { exact: true })
    .waitFor({ timeout: 5_000 });

  await page.getByRole("button", { name: "Show empty state" }).click();
  await page
    .getByText("There are no services available.", { exact: true })
    .waitFor();
  assert.equal(
    await page.getByText(/No services match/u).count(),
    0,
    "No-data state was presented as a filter miss",
  );
  await page.getByRole("button", { name: "Restore worklist" }).click();
  await page.getByText("Showing 4 of 4 services", { exact: true }).waitFor();
}

async function assertServiceWorklistNarrowLayout(page) {
  await page.setViewportSize({ width: 320, height: 800 });
  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await navigation.waitFor();
  const tableScroller = page.getByRole("region", {
    name: "Service health table",
  });
  await tableScroller.focus();
  assert(
    await tableScroller.evaluate(
      (element) =>
        element === document.activeElement &&
        element.scrollWidth > element.clientWidth &&
        document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
    ),
    "Service worklist did not preserve a contained keyboard-scroll region at 320 CSS pixels",
  );
  await tableScroller.press("ArrowRight");
  await page.waitForFunction(
    () => document.querySelector(".tableScroller")?.scrollLeft > 0,
    undefined,
    { timeout: 2_000 },
  );
  await assertNoAxeViolations(page, "operations-dashboard narrow worklist");
}

async function assertRecordFormWorkflow(page, screenshotRoot) {
  const createIncident = page
    .getByRole("button", { name: "Create incident" })
    .first();
  await createIncident.focus();
  assert(
    await createIncident.evaluate(
      (element) => element === document.activeElement,
    ),
  );
  await createIncident.click();
  let dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await page.getByRole("heading", { name: "Create incident" }).waitFor();
  assert.match(
    await dialog.innerText(),
    /No data leaves this demo/u,
    "Record form omitted its local-demo disclosure",
  );

  const title = page.getByLabel("Incident title");
  const service = page.getByLabel("Affected service or operational process");
  const close = dialog.getByRole("button", { name: "Close" });
  const submit = dialog.getByRole("button", { name: "Create incident" });
  for (const input of [title, service]) {
    const labelledBy = await input.getAttribute("aria-labelledby");
    assert(labelledBy, "Record form field has no label association");
    const label = page.locator(`label[id=${JSON.stringify(labelledBy)}]`);
    assert.equal(
      await label.count(),
      1,
      "Record form field is not associated with one visible label",
    );
    assert(await label.isVisible());
    await label.click();
    assert(
      await input.evaluate((element) => element === document.activeElement),
      "Clicking the field label did not focus its control",
    );
  }

  await title.focus();
  await page.keyboard.press("Tab");
  assert(
    await service.evaluate((element) => element === document.activeElement),
    "Tab did not move from incident title to affected service",
  );
  await page.keyboard.press("Tab");
  assert(
    await close.evaluate((element) => element === document.activeElement),
    "Tab did not move from affected service to Close",
  );
  await page.keyboard.press("Tab");
  assert(
    await submit.evaluate((element) => element === document.activeElement),
    "Tab did not move from Close to Create incident",
  );
  await page.keyboard.press("Shift+Tab");
  assert(
    await close.evaluate((element) => element === document.activeElement),
    "Shift+Tab did not return from Create incident to Close",
  );

  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  assert(
    await createIncident.evaluate(
      (element) => element === document.activeElement,
    ),
    "Record form did not return focus after Escape",
  );
  await createIncident.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();

  await title.fill("Draft retained on close");
  await service.fill("Order gateway");
  await close.focus();
  await page.keyboard.press("Enter");
  await dialog.waitFor({ state: "detached" });
  await createIncident.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  assert.equal(await title.inputValue(), "Draft retained on close");
  assert.equal(await service.inputValue(), "Order gateway");

  await title.fill("");
  await service.fill("");
  await dialog.getByRole("button", { name: "Create incident" }).click();
  const invalidSummary = page
    .getByRole("alert")
    .filter({ hasText: "Review the incident details before saving." });
  try {
    await invalidSummary.waitFor({ timeout: 1_500 });
  } catch (error) {
    if ((await invalidSummary.count()) === 0) {
      throw new Error("Record form accepted an empty invalid draft", {
        cause: error,
      });
    }
    throw error;
  }
  assert.equal(await invalidSummary.count(), 1);
  assert(
    await title.evaluate((element) => element === document.activeElement),
    "Invalid record form did not focus its first invalid field",
  );
  for (const [input, message] of [
    [
      title,
      "Enter at least 5 characters so the incident can be understood in the operations record.",
    ],
    [
      service,
      "Enter the affected service or operational process before saving this incident record.",
    ],
  ]) {
    assert.equal(
      await input.getAttribute("aria-invalid"),
      "true",
      "Invalid record form field did not expose aria-invalid",
    );
    const describedBy = await input.getAttribute("aria-describedby");
    assert(describedBy, "Invalid record form field has no described-by helper");
    const describedText = (
      await Promise.all(
        describedBy
          .split(/\s+/u)
          .map((id) => page.locator(`[id=${JSON.stringify(id)}]`).innerText()),
      )
    ).join(" ");
    assert(
      describedText.includes(message),
      "Record form validation message is not associated with its field",
    );
  }
  await assertNoAxeViolations(page, "operations-dashboard invalid record form");
  if (screenshotRoot) {
    await mkdir(screenshotRoot, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotRoot, "invalid.png"),
      fullPage: true,
    });
  }

  await service.fill("Risk calculator");
  await title.fill("Down");
  await page.keyboard.press("Enter");
  await invalidSummary.waitFor();
  assert.equal(await title.inputValue(), "Down");
  assert.equal(await dialog.count(), 1, "Record form accepted a short title");
  assert(
    await title.evaluate((element) => element === document.activeElement),
    "Short-title submission did not focus the invalid title",
  );
  assert.equal(await title.getAttribute("aria-invalid"), "true");
  assert.match(
    await dialog.innerText(),
    /Enter at least 5 characters/u,
    "Record form accepted a short invalid title",
  );
  await title.fill("Latency regression affecting order flow");
  await submit.click();
  await page.getByText("Saving incident.", { exact: true }).waitFor();
  assert((await title.getAttribute("readonly")) !== null);
  assert((await service.getAttribute("readonly")) !== null);
  assert(await dialog.getByRole("button", { name: "Close" }).isDisabled());
  await page.keyboard.press("Escape");
  assert.equal(await dialog.count(), 1, "Pending record form closed on Escape");
  await dialog
    .locator('form[aria-label="Create incident record"]')
    .evaluate((form) => form.requestSubmit());
  if (screenshotRoot) {
    await page.screenshot({
      path: path.join(screenshotRoot, "pending.png"),
      fullPage: true,
    });
  }

  const failure = page.getByRole("alert").filter({
    hasText:
      "The local demo rejected this first save. Your details are still available; retry when ready.",
  });
  await failure.waitFor({ timeout: 5_000 });
  assert.equal(
    await dialog.count(),
    1,
    "First local failure closed the dialog",
  );
  assert.equal(
    await title.inputValue(),
    "Latency regression affecting order flow",
  );
  assert.equal(await service.inputValue(), "Risk calculator");
  if (screenshotRoot) {
    await page.screenshot({
      path: path.join(screenshotRoot, "failure.png"),
      fullPage: true,
    });
  }

  await dialog.getByRole("button", { name: "Retry save" }).click();
  const success = page.getByRole("status").filter({
    hasText:
      "Local demo recorded Latency regression affecting order flow for Risk calculator. No notification was sent.",
  });
  await success.waitFor({ timeout: 5_000 });
  assert.equal(
    await success.count(),
    1,
    "Record form announced success more than once",
  );
  assert.equal(
    (await success.innerText()).trim(),
    "Local demo recorded Latency regression affecting order flow for Risk calculator. No notification was sent.",
  );
  await dialog.waitFor({ state: "detached" });
  assert(
    await createIncident.evaluate(
      (element) => element === document.activeElement,
    ),
    "Record form did not return focus to its trigger after success",
  );

  await page.setViewportSize({ width: 320, height: 800 });
  await createIncident.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await assertNoAxeViolations(page, "operations-dashboard narrow record form");
  if (screenshotRoot) {
    await page.screenshot({
      path: path.join(screenshotRoot, "narrow-320-css-px.png"),
      fullPage: true,
    });
  }
  const narrowLayout = await dialog.evaluate((element) => {
    const controls = [...element.querySelectorAll("input, button")];
    return {
      documentFits:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
      dialogFits: element.scrollWidth <= element.clientWidth,
      controlsVisible: controls.every((control) => {
        const bounds = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          bounds.width > 0 &&
          bounds.height > 0 &&
          bounds.left >= 0 &&
          bounds.right <= innerWidth &&
          bounds.top >= 0 &&
          bounds.bottom <= innerHeight
        );
      }),
    };
  });
  assert(
    narrowLayout.documentFits &&
      narrowLayout.dialogFits &&
      narrowLayout.controlsVisible,
    `Record form or its controls overflowed the 320 CSS-pixel viewport: ${JSON.stringify(narrowLayout)}`,
  );
  await dialog.getByRole("button", { name: "Close" }).click();
  await dialog.waitFor({ state: "detached" });
  return {
    status: "pass",
    validation: "pass",
    cancellation_retains_draft: true,
    pending_duplicate_rejected: true,
    failure_preserves_draft: true,
    retry_succeeds: true,
    focus: "pass",
    labels_and_errors: "associated",
    viewport_css_px: 320,
    zoom_claim: "not_tested",
    screenshots: screenshotRoot
      ? ["invalid.png", "pending.png", "failure.png", "narrow-320-css-px.png"]
      : [],
  };
}

async function browserChecks(appName, appRoot, environment, options = {}) {
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
        /A production-minded App Router start/u,
        "Next initial HTML omits Salt UI",
      );
      assert.match(html, /data-mode="light"/u, "Next initial HTML omits mode");
      assert.match(
        html,
        /data-density="low"/u,
        "Next initial HTML omits density",
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
      const worklistClockStart = Date.UTC(2026, 8, 8, 9, 42, 0);
      if (appName === "operations-dashboard") {
        await page.clock.install({ time: worklistClockStart });
        await page.clock.pauseAt(worklistClockStart + 1_000);
      }
      await page.goto(url, {
        waitUntil:
          appName === "operations-dashboard"
            ? "domcontentloaded"
            : "networkidle",
      });
      if (appName === "operations-dashboard") {
        await page.getByText("Loading worklist.", { exact: true }).waitFor();
        const refresh = page.getByRole("button", {
          name: "Refresh worklist",
        });
        await refresh.waitFor();
        assert(
          await refresh.isDisabled(),
          "Worklist refresh was enabled during its initial load",
        );
        await page.clock.runFor(350);
        await page.clock.resume();
      }
      const axeEntry = nodeRequire.resolve("axe-core");
      const axeSource = await readFile(
        path.join(path.dirname(axeEntry), "axe.min.js"),
        "utf8",
      );
      await page.addScriptTag({ content: axeSource });

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
      } else if (next) {
        await page
          .getByRole("heading", {
            name: "A production-minded App Router start",
          })
          .waitFor();

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

        const requestAccess = page.getByRole("button", {
          name: "Request access",
        });
        await requestAccess.focus();
        assert(
          await requestAccess.evaluate(
            (element) => element === document.activeElement,
          ),
        );
        await requestAccess.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "detached" });

        await requestAccess.click();
        await page
          .getByLabel("Business reason")
          .fill("Support operational review");
        await page.getByRole("button", { name: "Send request" }).click();
        await page.getByRole("status").waitFor();
        assert.match(await page.getByRole("status").innerText(), /sent/u);
        await dialog.waitFor({ state: "detached" });

        await page.setViewportSize({ width: 600, height: 800 });
        await page
          .getByRole("navigation", { name: "Primary navigation" })
          .waitFor();
      } else if (appName === "operations-dashboard") {
        await page
          .getByRole("heading", { name: "Operations overview" })
          .waitFor();
        await assertServiceWorklistReady(page);

        const mode = page.getByTestId("mode-toggle");
        await mode.focus();
        assert(
          await mode.evaluate((element) => element === document.activeElement),
        );
        await mode.click();
        assert.equal(
          await page.locator(".dashboardShell").getAttribute("data-mode"),
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
          await page.locator(".dashboardShell").getAttribute("data-density"),
          "high",
        );

        await mode.click();
        assert.equal(
          await page.locator(".dashboardShell").getAttribute("data-mode"),
          "light",
        );
        await density.click();
        assert.equal(
          await page.locator(".dashboardShell").getAttribute("data-density"),
          "low",
        );

        const recordForm = await assertRecordFormWorkflow(
          page,
          options.screenshotRoot,
        );
        await page.setViewportSize({ width: 1280, height: 800 });
        await assertServiceWorklistDetailAndRecovery(page);
        await assertServiceWorklistNarrowLayout(page);
        options.workflow = {
          ...recordForm,
          contract: "salt-sample-app-operations-dashboard-journey/1",
          navigation_current_location: "pass",
          worklist: {
            initial_loading: "pass",
            refresh_disabled_during_initial_load: true,
            loaded_service_count: 4,
            filtering: "pass",
            no_match: "pass",
            no_data: "pass",
            refresh_failure_preserves_data: true,
            retry_succeeds: true,
            inspection: "pass",
            editing: "pass",
          },
          theme: "pass",
        };
      }

      await assertNoAxeViolations(page, appName);
      assert.deepEqual(
        externalRequests,
        [],
        `${appName} attempted external requests`,
      );
      assert.deepEqual(runtimeErrors, [], `${appName} emitted browser errors`);
      return {
        ...(next ? { server_render: "pass", hydration: "pass" } : {}),
        runtime_errors: runtimeErrors.length,
        external_requests: externalRequests.length,
        ...(options.workflow ? { workflow: options.workflow } : {}),
      };
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
    await server.catch(() => undefined);
  }
}

async function currentCliChecks(appRoot, environment, knowledgeManifest) {
  const cli = path.join(
    appRoot,
    "node_modules",
    "@salt-ds",
    "cli",
    "bin",
    "salt-ds.js",
  );
  const before = await projectTreeDigest(appRoot);
  const commands = await verifyCurrentCliCommands({
    appRoot,
    knowledgeManifest,
    invoke: (arguments_) =>
      run(process.execPath, [cli, ...arguments_], {
        cwd: appRoot,
        env: environment,
        capture: true,
        label: `packed salt-ds ${arguments_[0]}`,
      }),
  });
  assert.equal(
    await projectTreeDigest(appRoot),
    before,
    "Current Salt CLI commands changed the isolated sample app",
  );
  return commands;
}

function isolatedManifest(appManifest, packed) {
  const manifest = structuredClone(appManifest);
  manifest.dependencies ??= {};
  manifest.devDependencies ??= {};
  for (const entry of packed) {
    const target = Object.hasOwn(manifest.dependencies, entry.name)
      ? manifest.dependencies
      : manifest.devDependencies;
    target[entry.name] = `file:../packs/${entry.filename}`;
  }
  return Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
}

async function installPackedCohort({ appName, appRoot, packed }) {
  const manifestPath = path.join(appRoot, "package.json");
  const originalManifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(originalManifestBytes.toString("utf8"));
  const installedManifestBytes = isolatedManifest(manifest, packed);
  await writeFile(manifestPath, installedManifestBytes);
  await run(
    executable("npm"),
    [
      "install",
      "--package-lock-only",
      "--no-audit",
      "--no-fund",
      "--prefer-offline",
    ],
    { cwd: appRoot, label: `${appName} lockfile generation` },
  );
  const lockfilePath = path.join(appRoot, "package-lock.json");
  const generatedLockfileBytes = await readFile(lockfilePath);
  await run(executable("npm"), ["ci", "--no-audit", "--no-fund"], {
    cwd: appRoot,
    label: `${appName} lockfile replay`,
  });
  const replayedLockfileBytes = await readFile(lockfilePath);
  assert(
    replayedLockfileBytes.equals(generatedLockfileBytes),
    `${appName} lockfile changed during replay`,
  );
  assert(
    (await readFile(manifestPath)).equals(installedManifestBytes),
    `${appName} isolated manifest changed during install`,
  );
  return { installedManifestBytes, replayedLockfileBytes };
}

async function readInstalledWorkflowRecipe(appRoot, knowledgeManifest) {
  const requireFromApp = createRequire(path.join(appRoot, "package.json"));
  const knowledge = requireFromApp("@salt-ds/knowledge");
  assert.equal(
    typeof knowledge.KnowledgeStore,
    "function",
    "Packed Knowledge does not export KnowledgeStore",
  );
  const knowledgePackagePath = requireFromApp.resolve(
    "@salt-ds/knowledge/package.json",
  );
  const store = new knowledge.KnowledgeStore({
    bundleDir: path.dirname(knowledgePackagePath),
  });
  assert.equal(
    store.manifest.bundle_digest,
    knowledgeManifest.bundle_digest,
    "Installed KnowledgeStore reads a different bundle",
  );
  assert.equal(
    store.manifest.semantic_digest,
    knowledgeManifest.semantic_digest,
    "Installed KnowledgeStore reads a different semantic bundle",
  );
  return readPackedWorkflowRecipe(store);
}

async function materializePackedWorkflow({ root, workflow }) {
  await mkdir(root, { recursive: true });
  for (const file of workflow.files) {
    const target = path.join(root, ...file.path.split("/"));
    inside(root, target, `Packed workflow file ${file.path}`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.bytes, { flag: "wx" });
  }
  const materializedPaths = (await sourceFiles(root)).map((file) =>
    portable(path.relative(root, file)),
  );
  assert.deepEqual(
    materializedPaths,
    workflow.files.map((file) => file.path).toSorted(),
    "Reconstructed workflow contains a file outside the packed recipe",
  );
}

async function validateReceipt(receipt) {
  const schema = await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltSampleAppCohortReceiptV2.schema.json",
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
const selectedNames = selectSampleAppNames(selectedApp);
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
    let isolatedManifestBytes;
    let packedWorkflow;
    let replayedLockfileBytes;
    if (app.name === "operations-dashboard") {
      // Bootstrap only enough consumer state to install the packed cohort. The
      // fresh app below is written exclusively from the installed Knowledge
      // recipe and its Store-verified artifacts.
      const bootstrapRoot = path.join(
        tempRoot,
        "operations-dashboard-bootstrap",
      );
      await mkdir(bootstrapRoot, { recursive: true });
      await writeFile(
        path.join(bootstrapRoot, "package.json"),
        app.manifestBytes,
        {
          flag: "wx",
        },
      );
      ({
        installedManifestBytes: isolatedManifestBytes,
        replayedLockfileBytes,
      } = await installPackedCohort({
        appName: app.name,
        appRoot: bootstrapRoot,
        packed,
      }));
      const bootstrapLockfile = JSON.parse(
        replayedLockfileBytes.toString("utf8"),
      );
      await verifyInstalledCohort(bootstrapRoot, packed, bootstrapLockfile);
      packedWorkflow = await readInstalledWorkflowRecipe(
        bootstrapRoot,
        knowledgeManifest,
      );
      assertPackedWorkflowManifestMatchesSource(
        packedWorkflow.manifestBytes,
        app.manifestBytes,
      );
      await materializePackedWorkflow({
        root: isolatedRoot,
        workflow: packedWorkflow,
      });
      await cp(
        path.join(bootstrapRoot, "node_modules"),
        path.join(isolatedRoot, "node_modules"),
        {
          recursive: true,
        },
      );
      await writeFile(
        path.join(isolatedRoot, "package-lock.json"),
        replayedLockfileBytes,
        { flag: "wx" },
      );
      const reconstructedLockfile = JSON.parse(
        replayedLockfileBytes.toString("utf8"),
      );
      await verifyInstalledCohort(isolatedRoot, packed, reconstructedLockfile);
    } else {
      await cp(app.appRoot, isolatedRoot, { recursive: true });
      ({
        installedManifestBytes: isolatedManifestBytes,
        replayedLockfileBytes,
      } = await installPackedCohort({
        appName: app.name,
        appRoot: isolatedRoot,
        packed,
      }));
      const lockfile = JSON.parse(replayedLockfileBytes.toString("utf8"));
      await verifyInstalledCohort(isolatedRoot, packed, lockfile);
      await writeFile(
        path.join(isolatedRoot, "package.json"),
        app.manifestBytes,
      );
    }

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
    const commands = await currentCliChecks(
      isolatedRoot,
      environment,
      knowledgeManifest,
    );
    const screenshotRoot =
      app.name === "operations-dashboard"
        ? path.join(outputRoot, "operations-dashboard.artifacts", "screenshots")
        : null;
    if (screenshotRoot) {
      inside(outputRoot, screenshotRoot, "Operations screenshot directory");
      await rm(screenshotRoot, { recursive: true, force: true });
    }
    const browser = await browserChecks(app.name, isolatedRoot, environment, {
      screenshotRoot,
    });
    if (app.name === "operations-dashboard") {
      const mutationRoot = path.join(
        tempRoot,
        "operations-dashboard-validation-removed",
      );
      await cp(isolatedRoot, mutationRoot, { recursive: true });
      const recordFormPath = path.join(
        mutationRoot,
        "src",
        "workflows",
        "record-form",
        "RecordForm.tsx",
      );
      const marker = "const nextErrors = validateRecordDraft(draft);";
      const source = await readFile(recordFormPath, "utf8");
      assert.equal(
        source.split(marker).length,
        2,
        "Validation-removal fixture did not find exactly one submit gate",
      );
      await writeFile(
        recordFormPath,
        source.replace(marker, "const nextErrors = {};"),
        "utf8",
      );
      await run(executable("npm"), ["run", "build"], {
        cwd: mutationRoot,
        env: environment,
        label: "validation-removed operations dashboard build",
      });
      let rejectedAtValidation = false;
      try {
        await browserChecks("operations-dashboard", mutationRoot, environment);
      } catch (error) {
        rejectedAtValidation =
          error instanceof Error &&
          /accepted an empty invalid draft/u.test(error.message);
      }
      assert(
        rejectedAtValidation,
        "Validation-removed operations dashboard was not rejected by the shared workflow assertions",
      );
      browser.workflow.validation_removed_variant = "rejected";
      const worklistMutationRoot = path.join(
        tempRoot,
        "operations-dashboard-worklist-failure-removed",
      );
      await cp(isolatedRoot, worklistMutationRoot, { recursive: true });
      const worklistAdapterPath = path.join(
        worklistMutationRoot,
        "src",
        "workflows",
        "service-worklist",
        "localWorklistAdapter.ts",
      );
      const failureMarker = "let failedOnce = false;";
      const adapterSource = await readFile(worklistAdapterPath, "utf8");
      assert.equal(
        adapterSource.split(failureMarker).length,
        2,
        "Worklist-failure fixture did not find exactly one fail-once gate",
      );
      await writeFile(
        worklistAdapterPath,
        adapterSource.replace(failureMarker, "let failedOnce = true;"),
        "utf8",
      );
      await run(executable("npm"), ["run", "build"], {
        cwd: worklistMutationRoot,
        env: environment,
        label: "failure-removed operations dashboard build",
      });
      let rejectedAtMissingWorklistBehavior = false;
      try {
        await browserChecks(
          "operations-dashboard",
          worklistMutationRoot,
          environment,
        );
      } catch (error) {
        rejectedAtMissingWorklistBehavior =
          error instanceof Error &&
          /did not expose its deterministic first refresh failure/u.test(
            error.message,
          );
      }
      assert(
        rejectedAtMissingWorklistBehavior,
        "Failure-removed operations dashboard was not rejected by the shared journey assertions",
      );
      browser.workflow.missing_worklist_behavior_variant = "rejected";
      browser.workflow.preview = await retainViteWorkflowPreview({
        appRoot: isolatedRoot,
        receiptArtifactRoot: artifactRoot,
        workflow: packedWorkflow,
      });
    }

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
      ...browser,
      commands,
      analysis: unavailableAnalysis(),
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
      "https://www.saltdesignsystem.com/ai/schemas/salt-sample-app-cohort-receipt-2.json",
    schema_version: "2.0.0",
    contract: "salt-sample-app-cohort-receipt/2",
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
