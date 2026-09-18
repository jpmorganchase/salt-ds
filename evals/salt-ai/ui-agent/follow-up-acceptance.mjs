import assert from "node:assert/strict";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

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
  for (const option of ["--root", "--seed", "--artifacts"]) {
    assert(values.has(option), `${option} is required`);
  }
  return {
    task,
    root: path.resolve(values.get("--root")),
    seed: path.resolve(values.get("--seed")),
    artifacts: path.resolve(values.get("--artifacts")),
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

async function capture(page, artifacts, name) {
  await mkdir(artifacts, { recursive: true });
  await page.screenshot({ path: path.join(artifacts, name), fullPage: true });
}

async function assertNoAxeViolations(page, label) {
  await page.evaluate(async () => {
    await document.fonts.ready;
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
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  const result = await page.evaluate(() => globalThis.axe.run());
  assert.deepEqual(result.violations, [], `${label} has axe violations`);
}

async function assertNarrowLayout(page, label) {
  const result = await page.evaluate(() => {
    const controls = [
      ...document.querySelectorAll(
        "input, textarea, select, button, [role=combobox]",
      ),
    ];
    return {
      viewportIsNarrow: innerWidth === 320,
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
    result.viewportIsNarrow && result.documentFits && result.controlsFit,
    `${label} overflows at 320 CSS pixels: ${JSON.stringify(result)}`,
  );
}

async function assertJourneyState(page, label, narrow) {
  await assertNoAxeViolations(page, label);
  if (narrow) await assertNarrowLayout(page, `${label} at 320 CSS pixels`);
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

async function chooseAccessLevel(page, label) {
  const radio = page.getByRole("radio", { name: label, exact: true });
  if ((await radio.count()) === 1) {
    await radio.focus();
    await radio.press("Space");
    assert(await radio.isChecked(), `${label} was not selected by keyboard`);
    return;
  }
  const accessLevel = page.getByLabel("Access level");
  if ((await accessLevel.evaluate((element) => element.tagName)) === "SELECT") {
    await accessLevel.focus();
    await accessLevel.press("Home");
    if (label === "Editor") await accessLevel.press("ArrowDown");
    await accessLevel.press("Enter");
    const selected = await accessLevel.evaluate((element) =>
      element instanceof HTMLSelectElement
        ? (element.selectedOptions[0]?.textContent?.trim() ?? "")
        : "",
    );
    assert.equal(selected, label, `${label} was not selected by keyboard`);
    return;
  }
  await accessLevel.focus();
  await accessLevel.press("Home");
  if (label === "Editor") await accessLevel.press("ArrowDown");
  await accessLevel.press("Enter");
  const selected = await accessLevel.evaluate((element) => {
    if (element instanceof HTMLInputElement) return element.value;
    return element.textContent?.trim() ?? "";
  });
  assert.equal(selected, label, `${label} was not selected by keyboard`);
}

async function assertViewerSelectedByDefault(page) {
  const viewer = page.getByRole("radio", { name: "Viewer", exact: true });
  if ((await viewer.count()) === 1) {
    assert(await viewer.isChecked(), "Viewer is not selected by default");
    return;
  }
  const selected = await page.getByLabel("Access level").evaluate((element) => {
    if (element instanceof HTMLSelectElement)
      return element.selectedOptions[0]?.textContent?.trim() ?? "";
    if (element instanceof HTMLInputElement) return element.value;
    return element.textContent?.trim() ?? "";
  });
  assert.equal(selected, "Viewer", "Viewer is not selected by default");
}

async function createReport(page, name, description, narrow) {
  const create = page.getByRole("button", { name: "New report" });
  await create.focus();
  await create.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Create report" });
  await dialog.waitFor();
  await assertJourneyState(page, `create report dialog for ${name}`, narrow);
  await dialog.getByLabel("Report name").fill(name);
  await dialog.getByLabel("Description").fill(description);
  await dialog.getByRole("button", { name: "Create report" }).press("Enter");
  await page
    .getByRole("status")
    .filter({ hasText: `Report "${name}" created.` })
    .waitFor();
  await dialog.waitFor({ state: "detached" });
  await assertFocus(
    page,
    create,
    "Creation did not restore focus to New report",
  );
}

async function acceptSavedReportLibrary(page, artifacts, narrow) {
  await page.getByRole("heading", { name: "Saved reports" }).waitFor();
  await page.getByText("No saved reports yet.", { exact: true }).waitFor();
  await assertJourneyState(page, "report library initial state", narrow);
  await capture(page, artifacts, "report-library-initial.png");

  await createReport(
    page,
    "Quarterly risk overview",
    "Summary of open operational risks.",
    narrow,
  );
  await createReport(
    page,
    "Supplier resilience register",
    "Ownership, dependencies and review dates.",
    narrow,
  );

  for (const report of [
    "Quarterly risk overview",
    "Supplier resilience register",
  ]) {
    assert.equal(
      await page.getByRole("button", { name: `Open report ${report}` }).count(),
      1,
      `${report} was replaced or its summary is not an accessible action`,
    );
  }
  await assertJourneyState(page, "report library with two reports", narrow);
  await capture(page, artifacts, "report-library-two-items.png");

  const search = page.getByLabel("Search reports");
  await search.fill("not-a-report");
  await page
    .getByText("No reports match your search.", { exact: true })
    .waitFor();
  await assertJourneyState(page, "report library no-match state", narrow);
  await page.getByRole("button", { name: "Clear search" }).press("Enter");
  for (const report of [
    "Quarterly risk overview",
    "Supplier resilience register",
  ]) {
    await page.getByRole("button", { name: `Open report ${report}` }).waitFor();
  }

  const openSupplier = page.getByRole("button", {
    name: "Open report Supplier resilience register",
  });
  await openSupplier.press("Enter");
  const details = page.getByRole("region", { name: "Report details" });
  await details.waitFor();
  await details
    .getByText("Supplier resilience register", { exact: true })
    .waitFor();
  await assertJourneyState(page, "selected report details", narrow);
  const edit = details.getByRole("button", { name: "Edit report" });
  await edit.press("Enter");
  let dialog = page.getByRole("dialog", { name: "Edit report" });
  await dialog.waitFor();
  const title = dialog.getByLabel("Report name");
  await title.fill("");
  await dialog.getByRole("button", { name: "Save report" }).press("Enter");
  await dialog
    .getByRole("alert")
    .filter({ hasText: "Enter a report name." })
    .waitFor();
  await assertFocus(
    page,
    title,
    "Invalid report save did not focus Report name",
  );
  await assertJourneyState(page, "invalid report edit", narrow);
  await title.fill("Supplier resilience register (updated)");
  await dialog
    .getByLabel("Description")
    .fill("Ownership, dependencies and updated review dates.");
  await dialog.getByRole("button", { name: "Cancel" }).press("Enter");
  await dialog.waitFor({ state: "detached" });
  await assertFocus(page, edit, "Edit cancellation did not restore focus");
  await details
    .getByText("Supplier resilience register", { exact: true })
    .waitFor();
  await details
    .getByText("Ownership, dependencies and review dates.", { exact: true })
    .waitFor();

  await edit.press("Enter");
  dialog = page.getByRole("dialog", { name: "Edit report" });
  await dialog.waitFor();
  await dialog
    .getByLabel("Report name")
    .fill("Supplier resilience register (updated)");
  await dialog
    .getByLabel("Description")
    .fill("Ownership, dependencies and updated review dates.");
  await dialog.getByRole("button", { name: "Save report" }).press("Enter");
  await page
    .getByRole("status")
    .filter({
      hasText: 'Report "Supplier resilience register (updated)" saved.',
    })
    .waitFor();
  await dialog.waitFor({ state: "detached" });
  await details
    .getByText("Supplier resilience register (updated)", { exact: true })
    .waitFor();
  await details
    .getByText("Ownership, dependencies and updated review dates.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Open report Quarterly risk overview" })
      .count(),
    1,
    "Saving the selected report lost the other report",
  );
  await assertJourneyState(page, "edited report details", narrow);
  await capture(page, artifacts, "report-library-edited-detail.png");
  if (narrow) {
    await capture(page, artifacts, "report-library-narrow.png");
  }
}

async function inviteCollaborator(page, email, accessLevel, narrow) {
  const invite = page.getByRole("button", { name: "Invite collaborator" });
  await invite.focus();
  await invite.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Invite collaborator" });
  await dialog.waitFor();
  if (accessLevel === "Viewer") await assertViewerSelectedByDefault(page);
  await assertJourneyState(page, `invite dialog for ${email}`, narrow);
  await dialog.getByLabel("Collaborator email").fill(email);
  await chooseAccessLevel(page, accessLevel);
  const send = dialog.getByRole("button", { name: "Send invitation" });
  await send.focus();
  await send.press("Enter");
  await page
    .getByRole("status")
    .filter({ hasText: `Invitation sent to ${email}.` })
    .waitFor();
  await dialog.waitFor({ state: "detached" });
  await assertFocus(page, invite, "Invitation did not restore focus");
}

async function acceptProjectTeamFollowUp(page, artifacts, narrow) {
  await page.getByRole("heading", { name: "Create a project" }).waitFor();
  await assertJourneyState(page, "project follow-up initial state", narrow);
  await capture(page, artifacts, "project-team-initial.png");

  const projectName = page.getByLabel("Project name");
  const ownerEmail = page.getByLabel("Owner email");
  await projectName.fill("Portfolio review");
  await ownerEmail.fill("draft-owner@example.com");
  const team = page.getByRole("link", { name: "Team", exact: true });
  await team.focus();
  await team.press("Enter");
  await page.waitForFunction(() => location.hash === "#team");
  await page.getByRole("heading", { name: "Team members" }).waitFor();
  const overview = page.getByRole("link", { name: "Overview", exact: true });
  await overview.focus();
  await overview.press("Enter");
  await page.waitForFunction(() => location.hash === "#overview");
  await page.getByRole("heading", { name: "Create a project" }).waitFor();
  assert.equal(
    await projectName.inputValue(),
    "Portfolio review",
    "Navigation discarded the unsaved project name",
  );
  assert.equal(
    await ownerEmail.inputValue(),
    "draft-owner@example.com",
    "Navigation discarded the unsaved owner email",
  );
  await assertJourneyState(page, "project draft after navigation", narrow);
  await capture(page, artifacts, "project-draft-return.png");

  await team.focus();
  await team.press("Enter");
  await page.waitForFunction(() => location.hash === "#team");
  await page.getByRole("heading", { name: "Team members" }).waitFor();
  await inviteCollaborator(page, "sam@example.com", "Editor", narrow);
  await inviteCollaborator(page, "lee@example.com", "Viewer", narrow);
  for (const [email, level] of [
    ["sam@example.com", "Editor"],
    ["lee@example.com", "Viewer"],
  ]) {
    const member = page
      .getByRole("listitem")
      .filter({ has: page.getByText(email, { exact: true }) });
    await member.waitFor();
    await member.getByText(level, { exact: true }).waitFor();
    await member.getByText("Pending", { exact: true }).waitFor();
  }
  await assertJourneyState(page, "team with two invitations", narrow);
  await capture(page, artifacts, "team-two-members.png");
  if (narrow) {
    await capture(page, artifacts, "team-two-members-narrow.png");
  }
}

async function runFrozenAcceptance(task, root, seed, artifacts) {
  const frozen = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "acceptance.mjs",
  );
  const result = await execa(
    process.execPath,
    [
      frozen,
      "--task",
      task,
      "--root",
      root,
      "--seed",
      seed,
      "--artifacts",
      path.join(artifacts, "baseline"),
    ],
    { cwd: root, env: process.env, reject: false },
  );
  assert.equal(
    result.exitCode,
    0,
    `Frozen acceptance failed:\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
  );
}

async function runFollowUpBrowserAcceptance(task, root, artifacts) {
  await rm(path.join(artifacts, "follow-up", "failure.png"), { force: true });
  const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");
  await stat(vite);
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  const server = execa(
    process.execPath,
    [vite, "preview", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: root, env: process.env, reject: false },
  );
  try {
    await waitForServer(url, server);
    const browser = await chromium.launch({
      channel: "chrome",
      headless: true,
    });
    let page;
    let activeArtifacts = path.join(artifacts, "follow-up");
    try {
      const errors = [];
      const externalRequests = [];
      const axeEntry = require.resolve("axe-core");
      const axeSource = await readFile(
        path.join(path.dirname(axeEntry), "axe.min.js"),
        "utf8",
      );
      const followUpArtifacts = path.join(artifacts, "follow-up");
      for (const journey of [
        {
          artifacts: followUpArtifacts,
          narrow: false,
          viewport: { width: 1280, height: 800 },
        },
        {
          artifacts: path.join(followUpArtifacts, "narrow-journey"),
          narrow: true,
          viewport: { width: 320, height: 800 },
        },
      ]) {
        activeArtifacts = journey.artifacts;
        page = await browser.newPage({ viewport: journey.viewport });
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
        await page.addScriptTag({ content: axeSource });
        if (task === "create-saved-report") {
          await acceptSavedReportLibrary(
            page,
            journey.artifacts,
            journey.narrow,
          );
        } else {
          await acceptProjectTeamFollowUp(
            page,
            journey.artifacts,
            journey.narrow,
          );
        }
        await page.close();
        page = undefined;
      }
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
      await capture(page, activeArtifacts, "failure.png").catch(
        () => undefined,
      );
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
await mkdir(artifacts, { recursive: true });
await rm(path.join(artifacts, "follow-up-evidence.json"), { force: true });
await runFrozenAcceptance(task, root, seed, artifacts);
await runFollowUpBrowserAcceptance(task, root, artifacts);
await writeFile(
  path.join(artifacts, "follow-up-evidence.json"),
  `${JSON.stringify(
    {
      task,
      frozenAcceptance: "passed",
      followUpScreenshots:
        task === "create-saved-report"
          ? {
              desktop: [
                "report-library-initial.png",
                "report-library-two-items.png",
                "report-library-edited-detail.png",
              ],
              narrowJourney: [
                "narrow-journey/report-library-initial.png",
                "narrow-journey/report-library-two-items.png",
                "narrow-journey/report-library-edited-detail.png",
                "narrow-journey/report-library-narrow.png",
              ],
            }
          : {
              desktop: [
                "project-team-initial.png",
                "project-draft-return.png",
                "team-two-members.png",
              ],
              narrowJourney: [
                "narrow-journey/project-team-initial.png",
                "narrow-journey/project-draft-return.png",
                "narrow-journey/team-two-members.png",
                "narrow-journey/team-two-members-narrow.png",
              ],
            },
      viewport: { desktop: [1280, 800], narrow: [320, 800] },
    },
    null,
    2,
  )}\n`,
);
console.log(`ui-agent follow-up acceptance passed: ${task}`);
