import assert from "node:assert/strict";
import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import process from "node:process";

import { execa } from "execa";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const TASKS = new Set(["create-saved-report", "modify-project-team"]);

function parseArgs(arguments_) {
  const values = new Map();
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    assert(
      ["--task", "--root", "--seed", "--artifacts"].includes(argument),
      `Unknown option: ${argument}`,
    );
    assert(!values.has(argument), `${argument} may be supplied only once`);
    const value = arguments_[index + 1];
    assert(value && !value.startsWith("--"), `${argument} needs a value`);
    values.set(argument, value);
    index += 1;
  }
  const task = values.get("--task");
  assert(TASKS.has(task), `Unknown task: ${task ?? "(missing)"}`);
  for (const option of ["--root", "--seed"]) {
    assert(values.has(option), `${option} is required`);
  }
  return {
    task,
    root: path.resolve(values.get("--root")),
    seed: path.resolve(values.get("--seed")),
    artifacts: values.has("--artifacts")
      ? path.resolve(values.get("--artifacts"))
      : undefined,
  };
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object", "Could not reserve a port");
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
        `Vite preview exited before ${url} was ready:\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite has not started listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function sourceFiles(root) {
  const pending = [path.join(root, "src")];
  const files = [];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of await (
      await import("node:fs/promises")
    ).readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(file);
      else if (/\.(?:css|ts|tsx)$/u.test(entry.name)) files.push(file);
    }
  }
  return files.toSorted();
}

async function assertSourceClosure(root, seed) {
  const [stagedManifest, seedManifest, files] = await Promise.all([
    readFile(path.join(root, "package.json")),
    readFile(path.join(seed, "package.json")),
    sourceFiles(root),
  ]);
  assert.deepEqual(
    stagedManifest,
    seedManifest,
    "The task changed package.json; the comparison cohort must stay fixed",
  );
  const source = (
    await Promise.all(files.map((file) => readFile(file, "utf8")))
  ).join("\n");
  assert.match(source, /SaltProviderNext/u, "Salt provider setup was removed");
  assert.match(
    source,
    /@salt-ds\/theme\/css\/global\.css/u,
    "Salt global CSS was removed",
  );
  assert.match(
    source,
    /@salt-ds\/theme\/css\/theme-next\.css/u,
    "Salt current theme CSS was removed",
  );
  const allowedSaltImports = new Set([
    "@salt-ds/core",
    "@salt-ds/icons",
    "@salt-ds/theme/css/global.css",
    "@salt-ds/theme/css/theme-next.css",
  ]);
  for (const match of source.matchAll(
    /(?:from\s+|import\s+)["'](@salt-ds\/[^"']+)["']/gu,
  )) {
    assert(
      allowedSaltImports.has(match[1]),
      `The task added a non-public or unpinned Salt import: ${match[1]}`,
    );
  }
  assert.doesNotMatch(
    source,
    /workspace:|(?:^|["'])file:|\.\.\/.*packages\//u,
    "The task added a repository-only import",
  );
  assert.doesNotMatch(
    source,
    /(?:https?:\/\/|fetch\(|XMLHttpRequest|WebSocket)/u,
    "The task added a network dependency",
  );
}

async function assertNoAxeViolations(page, label) {
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
  const result = await page.evaluate(() => globalThis.axe.run());
  assert.deepEqual(result.violations, [], `${label} has axe violations`);
}

async function assertNarrowLayout(page, label) {
  await page.setViewportSize({ width: 320, height: 800 });
  await assertNoAxeViolations(page, `${label} at 320 CSS pixels`);
  const result = await page.evaluate(() => {
    const controls = [
      ...document.querySelectorAll("input, select, button, [role=combobox]"),
    ];
    return {
      documentFits:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
      controlsFit: controls.every((control) => {
        const bounds = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          bounds.width > 0 &&
          bounds.height > 0 &&
          bounds.left >= 0 &&
          bounds.right <= innerWidth
        );
      }),
    };
  });
  assert(
    result.documentFits && result.controlsFit,
    `${label} overflows at 320 CSS pixels: ${JSON.stringify(result)}`,
  );
}

async function assertFocus(page, locator, message) {
  try {
    await page.waitForFunction(
      (element) => element === document.activeElement,
      await locator.elementHandle(),
      { timeout: 2_000 },
    );
  } catch {
    assert.fail(message);
  }
}

async function capture(page, artifacts, name) {
  if (!artifacts) return;
  await mkdir(artifacts, { recursive: true });
  await page.screenshot({ path: path.join(artifacts, name), fullPage: true });
}

async function acceptSavedReport(page, artifacts) {
  await page.getByRole("heading", { name: "Saved reports" }).waitFor();
  await page.getByText("No saved reports yet.", { exact: true }).waitFor();
  await assertNoAxeViolations(page, "saved reports initial state");
  await capture(page, artifacts, "initial.png");

  const create = page.getByRole("button", { name: "New report" });
  await create.focus();
  await assertFocus(page, create, "New report cannot receive keyboard focus");
  await create.click();
  let dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await assertNoAxeViolations(page, "saved reports create dialog");
  await capture(page, artifacts, "dialog.png");
  await assertNarrowLayout(page, "saved reports create dialog");
  await page.setViewportSize({ width: 1280, height: 800 });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await dialog.waitFor({ state: "detached" });
  await assertFocus(page, create, "Cancel did not restore focus to New report");

  await create.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await page.getByLabel("Report name").fill("Unsubmitted report");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  await assertFocus(page, create, "Escape did not restore focus to New report");
  assert.equal(
    await page.getByText("Unsubmitted report", { exact: true }).count(),
    0,
    "Escape created a report",
  );

  await create.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  const title = page.getByLabel("Report name");
  const description = page.getByLabel("Description");
  await dialog.getByRole("button", { name: "Create report" }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Enter a report name." })
    .waitFor();
  await assertFocus(
    page,
    title,
    "Invalid submission did not focus Report name",
  );
  await capture(page, artifacts, "validation.png");
  await title.fill("Quarterly risk overview");
  await description.fill("Summary of open operational risks.");
  await dialog.getByRole("button", { name: "Create report" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: 'Report "Quarterly risk overview" created.' })
    .waitFor();
  await dialog.waitFor({ state: "detached" });
  await assertFocus(page, create, "Successful creation did not restore focus");
  await page.getByText("Quarterly risk overview", { exact: true }).waitFor();
  await page
    .getByText("Summary of open operational risks.", { exact: true })
    .waitFor();
  await page.getByText("Draft", { exact: true }).waitFor();
  await capture(page, artifacts, "populated.png");
  await assertNarrowLayout(page, "saved reports");
  await capture(page, artifacts, "narrow.png");
}

async function assertViewerSelectedByDefault(page) {
  const viewerRadio = page.getByRole("radio", {
    name: "Viewer",
    exact: true,
  });
  if ((await viewerRadio.count()) === 1) {
    assert(await viewerRadio.isChecked(), "Viewer is not selected by default");
    return;
  }
  const accessLevel = page.getByLabel("Access level");
  const selected = await accessLevel.evaluate((element) => {
    if (element instanceof HTMLSelectElement) {
      return element.selectedOptions[0]?.textContent?.trim() ?? "";
    }
    if (element instanceof HTMLInputElement) return element.value;
    return element.textContent?.trim() ?? "";
  });
  assert.equal(selected, "Viewer", "Viewer is not selected by default");
}

async function chooseEditor(page) {
  const editorRadio = page.getByRole("radio", { name: "Editor", exact: true });
  if ((await editorRadio.count()) === 1) {
    await editorRadio.check();
    return;
  }
  const accessLevel = page.getByLabel("Access level");
  const tagName = await accessLevel.evaluate((element) => element.tagName);
  if (tagName === "SELECT") {
    await accessLevel.selectOption({ label: "Editor" });
    return;
  }
  await accessLevel.click();
  await page.getByRole("option", { name: "Editor", exact: true }).click();
}

async function acceptProjectTeam(page, artifacts) {
  await page.getByRole("heading", { name: "Create a project" }).waitFor();
  await assertNoAxeViolations(page, "project starter initial state");
  await capture(page, artifacts, "initial.png");

  const mode = page.getByTestId("mode-toggle");
  await mode.focus();
  await assertFocus(page, mode, "Mode toggle cannot receive keyboard focus");
  await mode.click();
  assert.equal(
    await page.locator(".appShell").getAttribute("data-mode"),
    "dark",
  );
  const density = page.getByTestId("density-toggle");
  await density.focus();
  await assertFocus(
    page,
    density,
    "Density toggle cannot receive keyboard focus",
  );
  await density.click();
  assert.equal(
    await page.locator(".appShell").getAttribute("data-density"),
    "high",
  );

  await page.getByRole("button", { name: "Preview launch" }).click();
  const preview = page.getByRole("dialog");
  await preview.waitFor();
  await page.keyboard.press("Escape");
  await preview.waitFor({ state: "detached" });
  await page.getByLabel("Project name").fill("Market insights");
  await page.getByLabel("Owner email").fill("owner@example.com");
  await page.getByRole("button", { name: "Save project" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Project settings saved." })
    .waitFor();

  const team = page.getByRole("link", { name: "Team", exact: true });
  await team.click();
  await page.waitForFunction(() => location.hash === "#team");
  await page.getByRole("heading", { name: "Team members" }).waitFor();
  await page.waitForFunction(
    (element) => {
      const current = element.getAttribute("aria-current");
      return current !== null && current !== "false";
    },
    await team.elementHandle(),
    { timeout: 2_000 },
  );
  const invite = page.getByRole("button", { name: "Invite collaborator" });
  await invite.focus();
  await assertFocus(page, invite, "Invite collaborator cannot receive focus");
  await invite.click();
  let dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await assertNoAxeViolations(page, "team invitation dialog");
  await capture(page, artifacts, "dialog.png");
  await assertViewerSelectedByDefault(page);
  await assertNarrowLayout(page, "team invitation dialog");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  await assertFocus(
    page,
    invite,
    "Escape did not restore focus to Invite collaborator",
  );
  assert.equal(
    await page.getByText("sam@example.com", { exact: true }).count(),
    0,
    "Dismissal added an invitation",
  );

  await invite.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await dialog.waitFor({ state: "detached" });
  await assertFocus(
    page,
    invite,
    "Cancel did not restore focus to Invite collaborator",
  );

  await invite.click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await page.getByLabel("Collaborator email").fill("sam@example.com");
  await chooseEditor(page);
  await dialog.getByRole("button", { name: "Send invitation" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Invitation sent to sam@example.com." })
    .waitFor();
  await dialog.waitFor({ state: "detached" });
  await assertFocus(
    page,
    invite,
    "Successful invitation did not restore focus",
  );
  await page.getByText("sam@example.com", { exact: true }).waitFor();
  await page.getByText("Editor", { exact: true }).waitFor();
  await page.getByText("Pending", { exact: true }).waitFor();
  await capture(page, artifacts, "populated.png");
  await assertNarrowLayout(page, "project team");
  await capture(page, artifacts, "narrow.png");
}

async function runBrowserAcceptance(task, root, artifacts) {
  if (artifacts) {
    await rm(path.join(artifacts, "failure.png"), { force: true });
  }
  const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");
  await stat(vite);
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  const server = execa(
    process.execPath,
    [vite, "preview", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: root,
      env: process.env,
      reject: false,
    },
  );
  try {
    await waitForServer(url, server);
    const browser = await chromium.launch({
      channel: "chrome",
      headless: true,
    });
    let page;
    try {
      page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const errors = [];
      const externalRequests = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
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
      const axeEntry = require.resolve("axe-core");
      const axeSource = await readFile(
        path.join(path.dirname(axeEntry), "axe.min.js"),
        "utf8",
      );
      await page.addScriptTag({ content: axeSource });
      if (task === "create-saved-report")
        await acceptSavedReport(page, artifacts);
      else await acceptProjectTeam(page, artifacts);
      assert.deepEqual(
        errors,
        [],
        `Browser reported runtime errors: ${errors.join(" | ")}`,
      );
      assert.deepEqual(
        externalRequests,
        [],
        `Browser requested external resources: ${externalRequests.join(" | ")}`,
      );
    } catch (error) {
      await capture(page, artifacts, "failure.png").catch(() => undefined);
      throw error;
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
    await server.catch(() => undefined);
  }
}

const { task, root, seed, artifacts } = parseArgs(process.argv.slice(2));
await assertSourceClosure(root, seed);
await runBrowserAcceptance(task, root, artifacts);
console.log(`ui-agent acceptance passed: ${task}`);
