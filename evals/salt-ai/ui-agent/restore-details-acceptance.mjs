import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
assert.equal(
  args.length,
  4,
  "Use --root <prepared app> --artifacts <new stage>",
);
assert.equal(args[0], "--root");
assert.equal(args[2], "--artifacts");
const root = path.resolve(args[1]);
const artifacts = path.resolve(args[3]);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const thisScript = fileURLToPath(import.meta.url);
const behaviorArtifacts = path.join(artifacts, "requalification");
const restoreArtifacts = path.join(artifacts, "restore");
const requalification = path.join(
  scriptDirectory,
  "requalification-acceptance.mjs",
);
const retrieval = path.join(scriptDirectory, "retrieval-acceptance.mjs");
const offlineGuard = path.resolve(
  scriptDirectory,
  "../../../scripts/saltSampleAppOfflineGuard.cjs",
);
const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
const excludedInputs = new Set([
  "node_modules",
  ".git",
  "dist",
  ".evidence",
  ".tools",
]);
const checkDefinition = {
  contract: "salt-ui-project-restore-details-acceptance/1",
  prerequisite: "requalification-acceptance.mjs unchanged and passed first",
  viewports: [1280, 320],
  checks: [
    "visible-trigger-disabled-before-first-save",
    "exact-draft-equality-and-single-field-differences",
    "invalid-and-empty-draft-navigation-round-trip",
    "labelled-modal-initial-focus-and-keyboard-containment",
    "keep-editing-and-escape-preserve-state-and-return-focus",
    "confirmation-restores-both-values-and-focuses-project-name",
    "no-submit-validation-save-or-launch-side-effects",
    "latest-valid-save-is-target-and-invalid-save-preserves-it",
    "saved-preview-and-launched-status-survive-restoration",
    "repeated-restoration-has-no-duplicate-dialogs-or-status",
    "desktop-narrow-dark-high-density-labelled-images-and-accessibility",
  ],
  visible_text_rule:
    "Restore saved details, Restore saved details?, Keep editing and Restore details must be visibly labelled and readable without horizontal clipping; modal text and actions must fit the viewport.",
};
const checkDefinitionHash = `sha256:${createHash("sha256").update(JSON.stringify(checkDefinition)).digest("hex")}`;

function guardedEnvironment() {
  const existing = process.env.NODE_OPTIONS?.trim();
  return {
    ...process.env,
    NODE_OPTIONS: [existing, `--require=${offlineGuard}`]
      .filter(Boolean)
      .join(" "),
    SALT_SAMPLE_APP_OFFLINE_GUARD: "1",
    NO_PROXY: "127.0.0.1,localhost,::1",
    no_proxy: "127.0.0.1,localhost,::1",
  };
}
async function treeDigest(treeRoot, excludedRootEntries = new Set()) {
  const hash = createHash("sha256");
  async function visit(directory) {
    for (const entry of (
      await readdir(directory, { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
      if (directory === treeRoot && excludedRootEntries.has(entry.name))
        continue;
      const file = path.join(directory, entry.name);
      assert(!entry.isSymbolicLink(), "Exercise inputs must be ordinary files");
      if (entry.isDirectory()) await visit(file);
      else {
        hash.update(path.relative(treeRoot, file).replaceAll("\\", "/"));
        hash.update("\0");
        hash.update(await readFile(file));
        hash.update("\0");
      }
    }
  }
  await visit(treeRoot);
  return `sha256:${hash.digest("hex")}`;
}
async function fileDigest(file) {
  return `sha256:${createHash("sha256")
    .update(await readFile(file))
    .digest("hex")}`;
}
async function availablePort() {
  const socket = net.createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const { port } = socket.address();
  await new Promise((resolve) => socket.close(resolve));
  return port;
}
async function waitForServer(url) {
  const deadline = Date.now() + 30_000;
  while (true) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* preview starting */
    }
    assert(Date.now() < deadline, "Preview did not start");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime),
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}
async function activate(locator) {
  await locator.focus();
  await locator.press("Enter");
}
async function navigate(page, name) {
  const item = page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name, exact: true });
  await activate(item);
  await page.waitForFunction(
    (fragment) => location.hash === fragment,
    `#${name.toLowerCase()}`,
  );
  assert.equal(await item.getAttribute("aria-current"), "page");
}
async function assertReadable(page, label, scope = page) {
  const locator = scope.getByText(label, { exact: true });
  await locator.waitFor();
  const detail = await locator.evaluate((node) => {
    const rectangle = (rect) => ({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    const range = document.createRange();
    range.selectNodeContents(node);
    const textRects = [...range.getClientRects()]
      .map(rectangle)
      .filter((rect) => rect.width > 0 && rect.height > 0);
    const clippingAncestors = [];
    for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
      const ancestorStyle = getComputedStyle(ancestor);
      if (ancestorStyle.overflowX === "visible") continue;
      const box = ancestor.getBoundingClientRect();
      const left =
        box.left + (Number.parseFloat(ancestorStyle.borderLeftWidth) || 0);
      clippingAncestors.push({ left, right: left + ancestor.clientWidth });
    }
    const style = getComputedStyle(node);
    return {
      text: node.textContent,
      textRects,
      clippingAncestors,
      hidden: style.visibility === "hidden" || style.display === "none",
    };
  });
  assert.equal(detail.text, label, `Exact label changed: ${label}`);
  assert(
    !detail.hidden && detail.textRects.length > 0,
    `Label is not visible: ${label}`,
  );
  const viewportWidth = await page.evaluate(() => innerWidth);
  for (const rect of detail.textRects) {
    assert(
      rect.left >= -0.5 && rect.right <= viewportWidth + 0.5,
      `Label is horizontally clipped: ${label}`,
    );
    for (const ancestor of detail.clippingAncestors)
      assert(
        rect.left >= ancestor.left - 0.5 && rect.right <= ancestor.right + 0.5,
        `Label is clipped by an ancestor: ${label}`,
      );
  }
}
async function recordScreenshotDigest(result, screenshot) {
  const file = path.resolve(artifacts, screenshot);
  const relative = path.relative(artifacts, file);
  assert(
    relative &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative) &&
      relative.replaceAll("\\", "/") === screenshot &&
      screenshot.endsWith(".png"),
    "Screenshot evidence must be a relative PNG path within this stage",
  );
  result.screenshot_digests[screenshot] = await fileDigest(file);
}
async function inspect(page, result, width, state, capture = true) {
  await settle(page);
  const violations = await page.evaluate(async () =>
    (
      await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations.map(({ id, nodes }) => ({ id, count: nodes.length })),
  );
  assert.deepEqual(violations, [], `Accessibility: ${state}/${width}`);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Horizontal overflow: ${state}/${width}`,
  );
  if (!capture) return;
  const screenshot = `restore/${width}-${state}.png`;
  await page.screenshot({
    path: path.join(artifacts, screenshot),
    fullPage: true,
  });
  await recordScreenshotDigest(result, screenshot);
  result.screenshots.push(screenshot);
}
async function assertReceiptBound(receipt, baseline) {
  assert.equal(
    receipt.status,
    "passed",
    "The unchanged requalification supplement did not pass",
  );
  for (const [key, actual] of Object.entries(baseline))
    assert.equal(
      receipt[key],
      actual,
      `Requalification receipt ${key} differs from this app`,
    );
  assert.equal(
    await treeDigest(root, excludedInputs),
    receipt.project_input_digest,
    "Project inputs changed after requalification",
  );
  assert.equal(
    await treeDigest(path.join(root, "src")),
    receipt.source_digest,
    "Source changed after requalification",
  );
  assert.equal(
    await treeDigest(path.join(root, "node_modules")),
    receipt.dependency_cohort_digest,
    "Dependencies changed after requalification",
  );
  assert.equal(
    await treeDigest(path.join(root, "dist")),
    receipt.compiled_digest,
    "Compiled output changed after requalification",
  );
}

async function assertFocused(page, locator, message) {
  const element = await locator.elementHandle();
  assert(element, message);
  try {
    await page.waitForFunction(
      (node) => document.activeElement === node,
      element,
    );
  } finally {
    await element.dispose();
  }
}

async function assertModalFocus(page, dialog) {
  await settle(page);
  await assertFocused(
    page,
    dialog.getByRole("button", { name: "Keep editing", exact: true }),
    "Keep editing receives initial confirmation focus",
  );
  const element = await dialog.elementHandle();
  assert(element, "The confirmation modal is mounted");
  const actions = ["Keep editing", "Restore details"];
  try {
    assert(
      await dialog.evaluate(
        (node) =>
          node.getAttribute("aria-modal") === "true" ||
          node.matches("dialog:modal"),
      ),
      "The confirmation is exposed as modal",
    );
    for (const key of ["Tab", "Shift+Tab"]) {
      const reached = new Set();
      for (let step = 0; step < 8; step++) {
        await page.keyboard.press(key);
        // Allow asynchronous focus guards to finish returning focus inside.
        await settle(page);
        assert(
          await page.evaluate(
            (node) => node.contains(document.activeElement),
            element,
          ),
          `${key} escaped the restore modal at step ${step + 1}`,
        );
        for (const action of actions)
          if (
            await dialog
              .getByRole("button", { name: action, exact: true })
              .evaluate((node) => node === document.activeElement)
          )
            reached.add(action);
      }
      for (const action of actions)
        assert(reached.has(action), `${key} must naturally reach ${action}`);
    }
  } finally {
    await element.dispose();
  }
}

async function activateModalAction(page, dialog, action) {
  const button = dialog.getByRole("button", { name: action, exact: true });
  const key = action === "Keep editing" ? "Shift+Tab" : "Tab";
  let reached = false;
  for (let step = 0; step < 8; step++) {
    await page.keyboard.press(key);
    await settle(page);
    assert(
      await dialog.evaluate((node) => node.contains(document.activeElement)),
      `${key} escaped the restore modal while reaching ${action}`,
    );
    if (await button.evaluate((node) => node === document.activeElement)) {
      reached = true;
      break;
    }
  }
  assert(reached, `${action} must be reached naturally before activation`);
  await page.keyboard.press("Enter");
}
async function assertModalReadable(page, dialog) {
  for (const label of [
    "Restore saved details?",
    "Keep editing",
    "Restore details",
  ]) {
    await assertReadable(page, label, dialog);
    const bounds = await dialog.getByText(label, { exact: true }).boundingBox();
    assert(bounds, `Visible modal label: ${label}`);
    assert(
      bounds.y >= -0.5 &&
        bounds.y + bounds.height <= page.viewportSize().height + 0.5,
      `Modal label is vertically outside the viewport: ${label}`,
    );
  }
}

async function stopPreviewServer(server, result) {
  const child = server.nodeChildProcess;
  const wasRunning =
    child.pid !== undefined &&
    child.exitCode === null &&
    child.signalCode === null &&
    !child.killed;
  let signalSent = false;
  let killError;
  if (wasRunning) {
    try {
      signalSent = server.kill("SIGTERM");
    } catch (error) {
      killError = error;
    }
  }
  let completionTimer;
  const completion = await Promise.race([
    server.then(
      (outcome) => ({ outcome }),
      (error) => ({ outcome: error, awaitError: error }),
    ),
    new Promise((resolve) => {
      completionTimer = setTimeout(
        () => resolve({ completionTimedOut: true }),
        10_000,
      );
    }),
  ]);
  clearTimeout(completionTimer);
  const { outcome, awaitError, completionTimedOut = false } = completion;
  let fallbackKillError;
  if (completionTimedOut) {
    try {
      server.kill("SIGKILL");
    } catch (error) {
      fallbackKillError = error;
    }
  }
  const shutdown = {
    status: "failed",
    was_running: wasRunning,
    signal_sent: signalSent,
    completion_timed_out: completionTimedOut,
    fallback_kill_error: fallbackKillError?.message ?? null,
    exit_code: outcome?.exitCode ?? null,
    signal: outcome?.signal ?? null,
    is_terminated: outcome?.isTerminated ?? false,
    execa_failed: outcome?.failed ?? null,
    timed_out: outcome?.timedOut ?? false,
    is_canceled: outcome?.isCanceled ?? false,
    is_max_buffer: outcome?.isMaxBuffer ?? false,
    is_forcefully_terminated: outcome?.isForcefullyTerminated ?? false,
    cause: outcome?.cause?.message ?? null,
    kill_error: killError?.message ?? null,
    await_error: awaitError?.message ?? null,
  };
  result.preview_shutdown = shutdown;
  assert(
    !completionTimedOut,
    "Preview did not settle within 10 seconds of shutdown",
  );
  assert(wasRunning, "Preview exited before harness shutdown");
  assert(
    !killError && signalSent,
    "Harness could not terminate the running preview",
  );
  assert(
    !awaitError,
    "Preview completion unexpectedly rejected with reject:false",
  );
  // Execa 10's default killDescendants:false uses ChildProcess.kill(). Its
  // Windows current-process signal result also has no exitCode and SIGTERM.
  assert(
    outcome.isTerminated === true &&
      outcome.signal === "SIGTERM" &&
      outcome.exitCode === undefined &&
      outcome.cause === undefined &&
      !outcome.timedOut &&
      !outcome.isCanceled &&
      !outcome.isMaxBuffer &&
      !outcome.isForcefullyTerminated,
    "Preview completion was not a clean harness-requested SIGTERM",
  );
  shutdown.status = "passed";
  return shutdown;
}
async function runRestoreAcceptance(result) {
  const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  const server = execa(
    process.execPath,
    [
      vite,
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    { cwd: root, env: guardedEnvironment(), reject: false },
  );
  let browser;
  let page;
  let observation;
  let runFailure;
  try {
    await waitForServer(url);
    browser = await chromium.launch({ channel: "chrome", headless: true });
    for (const width of checkDefinition.viewports) {
      observation = {
        width,
        status: "running",
        completed_checks: [],
        active_check: null,
      };
      result.viewport_observations.push(observation);
      const check = async (label, run) => {
        observation.active_check = label;
        await run();
        observation.completed_checks.push(label);
        observation.active_check = null;
      };
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        serviceWorkers: "block",
      });
      await context.routeWebSocket("**/*", async (socket) => {
        const request = new URL(socket.url());
        if (loopbackHosts.has(request.hostname)) socket.connectToServer();
        else {
          result.external_requests.push(request.href);
          await socket.close();
        }
      });
      await context.route("**/*", async (route) => {
        const request = new URL(route.request().url());
        if (
          ["data:", "blob:"].includes(request.protocol) ||
          loopbackHosts.has(request.hostname)
        )
          await route.continue();
        else {
          result.external_requests.push(request.href);
          await route.abort("blockedbyclient");
        }
      });
      page = await context.newPage();
      page.setDefaultTimeout(7000);
      page.on("pageerror", (error) => result.errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") result.errors.push(message.text());
      });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.addScriptTag({
        content: await readFile(require.resolve("axe-core/axe.min.js"), "utf8"),
      });
      // Observe browser events without preventing or altering application behavior.
      await page.evaluate(() => {
        window.restoreAcceptanceEvents = { submit: 0, invalid: 0 };
        for (const type of ["submit", "invalid"])
          document.addEventListener(
            type,
            () => window.restoreAcceptanceEvents[type]++,
            true,
          );
      });
      const name = page.getByRole("textbox", {
        name: "Project name",
        exact: true,
      });
      const email = page.getByRole("textbox", {
        name: "Owner email",
        exact: true,
      });
      const save = page.getByRole("button", {
        name: "Save project",
        exact: true,
      });
      const preview = page.getByRole("button", {
        name: "Preview launch",
        exact: true,
      });
      const restore = page.getByRole("button", {
        name: "Restore saved details",
        exact: true,
      });
      const modal = page.getByRole("dialog", {
        name: "Restore saved details?",
        exact: true,
      });
      const savedStatus = page.getByText("Project settings saved.", {
        exact: true,
      });
      const launchedStatus = page.getByText("Project launched", {
        exact: true,
      });
      const draft = async () => ({
        name: await name.inputValue(),
        email: await email.inputValue(),
      });
      const fill = async (values) => {
        await name.fill(values.name);
        await email.fill(values.email);
      };
      const assertDraft = async (values, label) =>
        assert.deepEqual(await draft(), values, label);
      const assertAvailability = async (disabled, label) => {
        assert.equal(
          await restore.count(),
          1,
          "Overview has one restore trigger",
        );
        assert(
          await restore.isVisible(),
          "Restore saved details remains visible",
        );
        assert.equal(await restore.isDisabled(), disabled, label);
      };
      const effects = async () => ({
        events: await page.evaluate(() => ({
          ...window.restoreAcceptanceEvents,
        })),
        saved_status: await savedStatus.count(),
        launched_status: await launchedStatus.count(),
      });
      const assertPassive = async (before, label) => {
        assert.deepEqual(await effects(), before, label);
        const messages = (await page.getByRole("status").allTextContents())
          .map((text) => text.trim())
          .filter(Boolean);
        assert.equal(
          new Set(messages).size,
          messages.length,
          "No duplicate status messages",
        );
      };
      const validation = async () => ({
        project_name: await page
          .getByRole("textbox", {
            name: "Project name",
            exact: true,
            includeHidden: true,
          })
          .getAttribute("aria-invalid"),
        owner_email: await page
          .getByRole("textbox", {
            name: "Owner email",
            exact: true,
            includeHidden: true,
          })
          .getAttribute("aria-invalid"),
        alerts: await page
          .getByRole("alert", { includeHidden: true })
          .allTextContents(),
      });
      let cleanValidation;
      const openRestore = async () => {
        const beforeValidation = await validation();
        await activate(restore);
        await modal.waitFor();
        await settle(page);
        assert.deepEqual(
          await validation(),
          beforeValidation,
          "Opening restore must not create validation state or alerts",
        );
        assert.equal(
          await page.getByRole("dialog").count(),
          1,
          "One active modal per activation",
        );
        await assertModalFocus(page, modal);
        await assertModalReadable(page, modal);
      };
      const closeRestore = async (action) => {
        if (action === "Escape") await page.keyboard.press("Escape");
        else await activateModalAction(page, modal, action);
        await modal.waitFor({ state: "hidden" });
        await assertFocused(
          page,
          action === "Restore details" ? name : restore,
          "Focus returns to the specified destination",
        );
        assert.equal(
          await page.getByRole("dialog").count(),
          0,
          "Closing restore leaves no duplicate modal",
        );
      };
      const savedPreview = async (values, screenshot) => {
        const beforeDraft = await draft();
        const before = await effects();
        await activate(preview);
        const review = page.getByRole("dialog");
        await review.waitFor();
        await activate(
          review.getByRole("button", {
            name: "Show review details",
            exact: true,
          }),
        );
        for (const value of [values.name, values.email]) {
          await review.getByText(value, { exact: true }).waitFor();
          await assertReadable(page, value, review);
        }
        if (screenshot) await inspect(page, result, width, screenshot);
        await activate(
          review.getByRole("button", { name: "Cancel", exact: true }),
        );
        await review.waitFor({ state: "hidden" });
        await assertFocused(
          page,
          preview,
          "Preview cancellation returns focus",
        );
        await assertDraft(
          beforeDraft,
          "Saved preview preserves the editable draft",
        );
        await assertPassive(
          before,
          "Preview cancellation preserves save and launch state",
        );
      };
      const roundTrip = async (values, disabled, launched) => {
        await navigate(page, "Team");
        await navigate(page, "Settings");
        assert.equal(
          await launchedStatus.count(),
          launched ? 1 : 0,
          "Settings preserves launch status",
        );
        await navigate(page, "Overview");
        await assertDraft(
          values,
          "Both draft fields survive Team and Settings",
        );
        await assertAvailability(
          disabled,
          "Restore availability survives navigation",
        );
        assert.equal(
          await launchedStatus.count(),
          launched ? 1 : 0,
          "Overview preserves launch status",
        );
      };
      const saveValues = async (values) => {
        await fill(values);
        await activate(save);
        await settle(page);
        await assertAvailability(
          true,
          "A valid saved draft disables restoration",
        );
        cleanValidation = await validation();
        for (const field of ["project_name", "owner_email"])
          assert.notEqual(
            cleanValidation[field],
            "true",
            "A valid save provides a clean validation baseline",
          );
        await savedPreview(values);
      };
      const restoreCycle = async (saved, dirty, state, launched) => {
        await fill(dirty);
        await assertAvailability(false, "A changed draft enables restoration");
        await roundTrip(dirty, false, launched);
        await assertReadable(page, "Restore saved details");
        await inspect(
          page,
          result,
          width,
          `${state}-dirty`,
          state === "light-low",
        );
        const before = await effects();
        const beforeValidation = await validation();
        await openRestore();
        await assertPassive(
          before,
          "Opening restore must not submit, validate, save or launch",
        );
        await inspect(
          page,
          result,
          width,
          `${state}-confirmation`,
          ["light-low", "dark-low", "dark-high"].includes(state),
        );
        await closeRestore("Keep editing");
        await assertDraft(dirty, "Keep editing preserves both draft values");
        await assertAvailability(
          false,
          "Cancelled dirty draft remains restorable",
        );
        await assertPassive(
          before,
          "Keep editing preserves save and launch state without validation",
        );
        assert.deepEqual(
          await validation(),
          beforeValidation,
          "Keep editing must not trigger submit validation",
        );
        await inspect(
          page,
          result,
          width,
          `${state}-cancelled`,
          state === "light-low",
        );
        await openRestore();
        await closeRestore("Escape");
        await assertDraft(dirty, "Escape preserves both draft values");
        await assertAvailability(
          false,
          "Escaped dirty draft remains restorable",
        );
        await assertPassive(
          before,
          "Escape preserves save and launch state without validation",
        );
        assert.deepEqual(
          await validation(),
          beforeValidation,
          "Escape must not trigger submit validation",
        );
        await savedPreview(saved);
        await openRestore();
        await closeRestore("Restore details");
        await assertDraft(
          saved,
          "Confirmation restores both values from the latest valid snapshot",
        );
        await assertAvailability(
          true,
          "Restored draft exactly equals saved details",
        );
        await assertPassive(
          before,
          "Confirmation must not submit, validate, save or launch",
        );
        const afterValidation = await validation();
        // Existing errors may clear when valid saved details replace an invalid
        // submitted draft. A clean draft must not acquire errors on confirmation.
        if (state === "light-low") {
          assert.deepEqual(
            beforeValidation,
            cleanValidation,
            "The first invalid draft starts with clean validation",
          );
          assert.deepEqual(
            afterValidation,
            cleanValidation,
            "Restoring an unsubmitted invalid draft must not create validation or alerts",
          );
        } else {
          for (const field of ["project_name", "owner_email"])
            assert(
              [cleanValidation[field], beforeValidation[field]].includes(
                afterValidation[field],
              ),
              "Confirmation may clear existing validation but cannot add it",
            );
          for (const alert of afterValidation.alerts)
            assert(
              [...cleanValidation.alerts, ...beforeValidation.alerts].includes(
                alert,
              ),
              "Confirmation cannot add validation alerts",
            );
        }

        await inspect(
          page,
          result,
          width,
          `${state}-restored`,
          ["light-low", "dark-low", "dark-high"].includes(state),
        );
        await savedPreview(
          saved,
          state === "light-low" ? `${state}-saved-after-restore` : undefined,
        );
        await roundTrip(saved, true, launched);
      };

      const first = {
        name: "Quarterly planning",
        email: "planner@example.com",
      };
      const latest = { name: "Autumn delivery", email: "delivery@example.com" };
      await check("visible-trigger-disabled-before-first-save", async () => {
        await restore.waitFor();
        await assertAvailability(
          true,
          "Restore is disabled before any valid save",
        );
        await fill({ name: "", email: "invalid" });
        await activate(save);
        await assertAvailability(
          true,
          "An invalid first save cannot enable restoration",
        );
        await fill(first);
        await assertAvailability(
          true,
          "A valid unsaved draft still has no restoration target",
        );
      });
      await check("exact-equality-and-single-field-differences", async () => {
        await saveValues(first);
        await name.fill(`${first.name} `);
        await assertAvailability(
          false,
          "A trailing space is an exact draft difference",
        );
        await name.fill(first.name);
        await assertAvailability(
          true,
          "Returning only the changed name disables restore",
        );
        await email.fill("other@example.com");
        await assertAvailability(
          false,
          "An email-only difference enables restore",
        );
        await email.fill(first.email);
        await assertAvailability(
          true,
          "Returning only the changed email disables restore",
        );
      });
      await check("invalid-draft-modal-cancel-escape-and-confirm", async () => {
        await restoreCycle(
          first,
          { name: "", email: "unfinished" },
          "light-low",
          false,
        );
      });
      await check(
        "latest-valid-target-invalid-save-and-repeated-restore",
        async () => {
          await saveValues(latest);
          const invalidDraft = { name: "Rejected snapshot", email: "" };
          await fill(invalidDraft);
          await activate(save);
          await assertAvailability(
            false,
            "Invalid save preserves the valid restoration target",
          );
          await savedPreview(latest);
          await restoreCycle(latest, invalidDraft, "latest-valid", false);
          await restoreCycle(
            latest,
            { name: "Another draft", email: "other@example.com" },
            "repeat",
            false,
          );
        },
      );
      await check("launched-state-dark-and-high-density", async () => {
        await activate(preview);
        const review = page.getByRole("dialog");
        await review.waitFor();
        await activate(
          review.getByRole("button", { name: "Launch project", exact: true }),
        );
        await review.waitFor({ state: "hidden" });
        await launchedStatus.waitFor();
        assert.equal(
          await launchedStatus.count(),
          1,
          "The existing project launch succeeds once",
        );
        await activate(page.getByTestId("mode-toggle"));
        assert.equal(
          await page.locator(".appShell").getAttribute("data-mode"),
          "dark",
        );
        await restoreCycle(latest, { name: "", email: "" }, "dark-low", true);
        await activate(page.getByTestId("density-toggle"));
        assert.equal(
          await page.locator(".appShell").getAttribute("data-density"),
          "high",
        );
        await restoreCycle(
          latest,
          { name: "High density draft", email: "invalid" },
          "dark-high",
          true,
        );
      });
      observation.status = "passed";
      await context.close();
      page = undefined;
    }
    assert.deepEqual(result.errors, [], "Browser reported runtime errors");
    assert.deepEqual(
      result.external_requests,
      [],
      "Browser requested external resources",
    );
  } catch (error) {
    runFailure = error;
    if (observation) observation.status = "failed";
    const screenshot = "restore/failure.png";
    if (page) {
      try {
        await page.screenshot({
          path: path.join(artifacts, screenshot),
          fullPage: true,
        });
        await recordScreenshotDigest(result, screenshot);
        result.screenshots.push(screenshot);
      } catch (screenshotError) {
        result.screenshot_errors.push({
          screenshot,
          message: screenshotError?.message ?? String(screenshotError),
        });
      }
    } else
      result.screenshot_errors.push({
        screenshot,
        message: "No active page for failure screenshot",
      });
  } finally {
    for (const [resource, close] of [
      ["browser", () => browser?.close()],
      ["preview", () => stopPreviewServer(server, result)],
    ]) {
      try {
        await close();
      } catch (error) {
        result.teardown_failures.push({
          resource,
          name: error?.name ?? "Error",
          message: error?.message ?? String(error),
        });
        runFailure ??= error;
      }
    }
  }
  if (runFailure) throw runFailure;
}
const harnessDigests = {
  supplement_script_sha256: await fileDigest(thisScript),
  requalification_acceptance_script_sha256: await fileDigest(requalification),
  retrieval_acceptance_script_sha256: await fileDigest(retrieval),
};
await mkdir(path.dirname(artifacts), { recursive: true });
await mkdir(artifacts); // A new stage is required: do not overwrite prior receipts or images.
await mkdir(restoreArtifacts);
const baseline = {
  source_digest: await treeDigest(path.join(root, "src")),
  project_input_digest: await treeDigest(root, excludedInputs),
  dependency_cohort_digest: await treeDigest(path.join(root, "node_modules")),
};
const result = {
  status: "failed",
  check_definition: checkDefinition,
  check_definition_hash: checkDefinitionHash,
  behavior_receipt: "requalification/result.json",
  harness_digests: harnessDigests,
  original_receipt: null,
  prerequisite_receipt_digests: null,
  viewport_observations: [],
  screenshots: [],
  screenshot_digests: {},
  screenshot_errors: [],
  errors: [],
  external_requests: [],
  preview_shutdown: null,
  teardown_failures: [],
  integrity_failure: null,
  screenshot_integrity_failure: null,
  harness_integrity_failure: null,
  failure: null,
};
let receipt;
let failure;
try {
  const behavior = await execa(
    process.execPath,
    [requalification, "--root", root, "--artifacts", behaviorArtifacts],
    { cwd: root, env: guardedEnvironment(), reject: false },
  );
  assert.equal(
    behavior.exitCode,
    0,
    `Unchanged requalification acceptance failed:\n${behavior.stdout ?? ""}\n${behavior.stderr ?? ""}`,
  );
  receipt = JSON.parse(
    await readFile(path.join(behaviorArtifacts, "result.json"), "utf8"),
  );
  result.original_receipt = receipt;
  result.prerequisite_receipt_digests = {
    requalification_receipt_sha256: await fileDigest(
      path.join(behaviorArtifacts, "result.json"),
    ),
    original_behavior_receipt_sha256: await fileDigest(
      path.join(behaviorArtifacts, "behavior/result.json"),
    ),
  };
  await assertReceiptBound(receipt, baseline);
  for (const screenshot of [
    ...receipt.screenshots.map((file) => `requalification/${file}`),
    ...receipt.original_receipt.screenshots.map(
      (file) => `requalification/behavior/${file}`,
    ),
  ])
    await recordScreenshotDigest(result, screenshot);
  await runRestoreAcceptance(result);
  result.status = "passed";
} catch (error) {
  failure = error;
  result.failure = {
    name: error?.name ?? "Error",
    message: error?.message ?? String(error),
  };
} finally {
  if (receipt)
    try {
      await assertReceiptBound(receipt, baseline);
      assert.deepEqual(
        {
          requalification_receipt_sha256: await fileDigest(
            path.join(behaviorArtifacts, "result.json"),
          ),
          original_behavior_receipt_sha256: await fileDigest(
            path.join(behaviorArtifacts, "behavior/result.json"),
          ),
        },
        result.prerequisite_receipt_digests,
        "Prerequisite receipts changed during restore acceptance",
      );
    } catch (error) {
      result.integrity_failure = {
        name: error?.name ?? "Error",
        message: error?.message ?? String(error),
      };
      if (!failure) {
        failure = error;
        result.failure = result.integrity_failure;
      }
    }
  try {
    for (const [screenshot, digest] of Object.entries(
      result.screenshot_digests,
    ))
      assert.equal(
        await fileDigest(path.join(artifacts, screenshot)),
        digest,
        `Screenshot evidence changed during acceptance: ${screenshot}`,
      );
  } catch (error) {
    result.screenshot_integrity_failure = {
      name: error?.name ?? "Error",
      message: error?.message ?? String(error),
    };
    if (!failure) {
      failure = error;
      result.failure = result.screenshot_integrity_failure;
    }
  }
  try {
    assert.deepEqual(
      {
        supplement_script_sha256: await fileDigest(thisScript),
        requalification_acceptance_script_sha256:
          await fileDigest(requalification),
        retrieval_acceptance_script_sha256: await fileDigest(retrieval),
      },
      harnessDigests,
      "Acceptance harness scripts changed during the supplement",
    );
  } catch (error) {
    result.harness_integrity_failure = {
      name: error?.name ?? "Error",
      message: error?.message ?? String(error),
    };
    if (!failure) {
      failure = error;
      result.failure = result.harness_integrity_failure;
    }
  }
  if (receipt)
    Object.assign(result, {
      source_digest: receipt.source_digest,
      project_input_digest: receipt.project_input_digest,
      dependency_cohort_digest: receipt.dependency_cohort_digest,
      compiled_digest: receipt.compiled_digest,
    });
  if (failure) result.status = "failed";
  await writeFile(
    path.join(artifacts, "result.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
}
if (failure) throw failure;
console.log("Project restore details acceptance supplement passed.");
