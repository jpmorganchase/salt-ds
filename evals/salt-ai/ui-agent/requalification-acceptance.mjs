import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { chromium } from "playwright";

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
const behaviorArtifacts = path.join(artifacts, "behavior");
const readabilityArtifacts = path.join(artifacts, "readability");
const retrievalAcceptance = path.join(
  scriptDirectory,
  "retrieval-acceptance.mjs",
);
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
  contract: "salt-ui-project-launch-requalification-readability/1",
  behavior_receipt: "behavior/result.json",
  viewports: [1280, 320],
  checks: [
    "initial-dialog-focus",
    "dialog-tab-and-shift-tab-containment",
    "saved-name-and-email-range-rect-readability",
    "reachable-dialog-content-vertical-scroll-for-long-values",
  ],
  visible_text_rule:
    "Text must fit the viewport and every clipping ancestor client box on X; long values may use a verified wheel-reachable DialogContent Y scroll state.",
};
const checkDefinitionHash = `sha256:${createHash("sha256")
  .update(JSON.stringify(checkDefinition))
  .digest("hex")}`;

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
      // The local preview is still starting.
    }
    assert(Date.now() < deadline, "Preview did not start");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

class ReadabilityFailure extends Error {
  constructor(details) {
    super(`Saved text is not fully readable: ${JSON.stringify(details)}`);
    this.name = "ReadabilityFailure";
    this.details = details;
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

async function assertTextFullyReadable(
  dialog,
  text,
  label,
  captureFailure,
  requiredAxes = { x: true, y: true },
) {
  const element = dialog.getByText(text, { exact: true });
  await element.waitFor();
  const details = await element.evaluate((node, expected) => {
    const rectangle = (rect) => ({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    const containsX = (rect, box) =>
      rect.left >= box.left - 0.5 && rect.right <= box.right + 0.5;
    const containsY = (rect, box) =>
      rect.top >= box.top - 0.5 && rect.bottom <= box.bottom + 0.5;
    const range = document.createRange();
    range.selectNodeContents(node);
    const textRects = [...range.getClientRects()]
      .map(rectangle)
      .filter((rect) => rect.width > 0 && rect.height > 0);
    const clippingAncestors = [];
    for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const clips_x = style.overflowX !== "visible";
      const clips_y = style.overflowY !== "visible";
      if (!clips_x && !clips_y) continue;
      const borderBox = ancestor.getBoundingClientRect();
      const left =
        borderBox.left + (Number.parseFloat(style.borderLeftWidth) || 0);
      const top =
        borderBox.top + (Number.parseFloat(style.borderTopWidth) || 0);
      const client_box = {
        left,
        top,
        right: left + ancestor.clientWidth,
        bottom: top + ancestor.clientHeight,
        width: ancestor.clientWidth,
        height: ancestor.clientHeight,
      };
      clippingAncestors.push({
        tag: ancestor.tagName,
        id: ancestor.id || null,
        className: ancestor.className || null,
        clips_x,
        clips_y,
        client_box,
      });
    }
    const viewport = {
      left: 0,
      top: 0,
      right: innerWidth,
      bottom: innerHeight,
    };
    const failures = textRects.flatMap((rect, line) => {
      const outside = [];
      if (!containsX(rect, viewport))
        outside.push({ boundary: "viewport", axis: "x", box: viewport });
      if (!containsY(rect, viewport))
        outside.push({ boundary: "viewport", axis: "y", box: viewport });
      for (const ancestor of clippingAncestors) {
        if (ancestor.clips_x && !containsX(rect, ancestor.client_box))
          outside.push({
            boundary: "clipping-ancestor",
            axis: "x",
            ancestor,
            box: ancestor.client_box,
          });
        if (ancestor.clips_y && !containsY(rect, ancestor.client_box))
          outside.push({
            boundary: "clipping-ancestor",
            axis: "y",
            ancestor,
            box: ancestor.client_box,
          });
      }
      return outside.map((failure) => ({ line, rect, ...failure }));
    });
    return {
      expected,
      actual: node.textContent,
      text_rects: textRects,
      clipping_ancestors: clippingAncestors,
      failures,
    };
  }, text);
  if (
    details.actual !== text ||
    details.text_rects.length === 0 ||
    details.failures.some((failure) => requiredAxes[failure.axis])
  ) {
    await captureFailure();
    throw new ReadabilityFailure({ label, ...details });
  }
}

async function scrollDialogContentToLongValue(page, dialog) {
  const content = dialog.locator(".saltDialogContent-inner");
  await content.waitFor();
  const before = await content.evaluate((element) => ({
    scroll_top: element.scrollTop,
    scroll_height: element.scrollHeight,
    client_height: element.clientHeight,
  }));
  if (before.scroll_height - before.client_height <= before.scroll_top + 1) {
    return { trigger: "not-needed", before, after: before };
  }
  await content.hover();
  await page.mouse.wheel(0, before.scroll_height);
  const contentElement = await content.elementHandle();
  try {
    await page.waitForFunction(
      (element) =>
        element.scrollTop >= element.scrollHeight - element.clientHeight - 1,
      contentElement,
    );
  } finally {
    await contentElement?.dispose();
  }
  await settle(page);
  const after = await content.evaluate((element) => ({
    scroll_top: element.scrollTop,
    scroll_height: element.scrollHeight,
    client_height: element.clientHeight,
  }));
  assert(
    after.scroll_top > before.scroll_top,
    "A wheel gesture in DialogContent must reveal lower saved review details",
  );
  return { trigger: "wheel", before, after };
}
async function assertInitialDialogFocusAndContainment(
  page,
  dialog,
  observation,
) {
  const launch = dialog.getByRole("button", {
    name: "Launch project",
    exact: true,
  });
  await launch.waitFor();
  await settle(page);
  const launchElement = await launch.elementHandle();
  assert(launchElement, "Launch project is mounted in the review dialog");
  try {
    await page.waitForFunction(
      (element) => document.activeElement === element,
      launchElement,
    );
  } finally {
    await launchElement.dispose();
  }
  observation.checks.initial_dialog_focus = "passed";
  const dialogElement = await dialog.elementHandle();
  assert(dialogElement, "Review dialog is mounted");
  try {
    const focused = page.locator(":focus");
    for (const key of ["Tab", "Shift+Tab"]) {
      for (let step = 0; step < 12; step++) {
        await page.keyboard.press(key);
        // Floating UI wraps focus through a guard outside the dialog first.
        await settle(page);
        assert(
          await focused.evaluate(
            (node, element) => element.contains(node),
            dialogElement,
          ),
          `${key} escaped the review dialog at step ${step + 1}`,
        );
      }
    }
  } finally {
    await dialogElement.dispose();
  }
  observation.checks.dialog_tab_and_shift_tab_containment = "passed";
}

async function prepareSavedValues(page, values, observation) {
  const name = page.getByRole("textbox", { name: "Project name", exact: true });
  const email = page.getByRole("textbox", { name: "Owner email", exact: true });
  await name.fill(values.projectName);
  await email.fill(values.ownerEmail);
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await page.getByText("Project settings saved.", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Preview launch", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  observation.checks.initial_dialog_focus = "pending";
  observation.checks.dialog_tab_and_shift_tab_containment = "pending";
  await assertInitialDialogFocusAndContainment(page, dialog, observation);
  await dialog
    .getByRole("button", { name: "Show review details", exact: true })
    .click();
  await dialog.getByText(values.projectName, { exact: true }).waitFor();
  await dialog.getByText(values.ownerEmail, { exact: true }).waitFor();
  await settle(page);
  return dialog;
}

function aggregateNamedChecks(result) {
  for (const name of Object.keys(result.named_checks)) {
    const statuses = result.viewport_observations.map(
      (observation) => observation.checks[name],
    );
    result.named_checks[name] = statuses.includes("failed")
      ? "failed"
      : statuses.length === 2 && statuses.every((status) => status === "passed")
        ? "passed"
        : "pending";
  }
}

async function runReadabilityAcceptance(result) {
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
    {
      cwd: root,
      env: guardedEnvironment(),
      reject: false,
    },
  );
  let browser;
  let page;
  let activeObservation;
  let readabilityFailureCaptured = false;
  const captureReadabilityFailure = async () => {
    if (readabilityFailureCaptured) return;
    const failure = "readability/readability-failure.png";
    if (!page) {
      result.screenshot_errors.push({
        screenshot: failure,
        message: "No active page for failure screenshot",
      });
    } else {
      try {
        await page.screenshot({
          path: path.join(artifacts, failure),
          fullPage: true,
        });
        result.screenshots.push(failure);
      } catch (error) {
        result.screenshot_errors.push({
          screenshot: failure,
          message: error?.message ?? String(error),
        });
      }
    }
    readabilityFailureCaptured = true;
  };
  const ordinaryValues = {
    projectName: "Quarterly planning",
    ownerEmail: "planner@example.com",
  };
  const longValues = {
    projectName:
      "International programme delivery assurance and governance review for the quarterly planning portfolio",
    ownerEmail:
      "alexandra.montgomery+international-programme-delivery-assurance@example.com",
  };
  try {
    await waitForServer(url);
    browser = await chromium.launch({ channel: "chrome", headless: true });
    for (const width of [1280, 320]) {
      activeObservation = {
        width,
        checks: {
          initial_dialog_focus: "pending",
          dialog_tab_and_shift_tab_containment: "pending",
          saved_name_and_email_range_rect_readability: "pending",
        },
      };
      result.viewport_observations.push(activeObservation);
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
      page = await context.newPage();
      page.setDefaultTimeout(7000);
      page.on("pageerror", (error) => result.errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") result.errors.push(message.text());
      });
      await page.route("**/*", async (route) => {
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
      await page.goto(url, { waitUntil: "networkidle" });
      let dialog = await prepareSavedValues(
        page,
        ordinaryValues,
        activeObservation,
      );
      const ordinaryScreenshot = `readability/details-${width}.png`;
      await page.screenshot({
        path: path.join(artifacts, ordinaryScreenshot),
        fullPage: true,
      });
      result.screenshots.push(ordinaryScreenshot);
      await assertTextFullyReadable(
        dialog,
        ordinaryValues.projectName,
        "saved project name",
        captureReadabilityFailure,
      );
      await assertTextFullyReadable(
        dialog,
        ordinaryValues.ownerEmail,
        "saved owner email",
        captureReadabilityFailure,
      );
      await page.reload({ waitUntil: "networkidle" });
      dialog = await prepareSavedValues(page, longValues, activeObservation);
      if (width === 320) {
        const longNameScreenshot = "readability/long-name-320.png";
        await page.screenshot({
          path: path.join(artifacts, longNameScreenshot),
          fullPage: true,
        });
        result.screenshots.push(longNameScreenshot);
      }
      await assertTextFullyReadable(
        dialog,
        longValues.projectName,
        "long saved project name",
        captureReadabilityFailure,
      );
      await assertTextFullyReadable(
        dialog,
        longValues.ownerEmail,
        "long saved owner email horizontal readability",
        captureReadabilityFailure,
        { x: true, y: false },
      );
      if (width === 320) {
        result.vertical_scroll_observations.push({
          width,
          ...(await scrollDialogContentToLongValue(page, dialog)),
        });
        const longEmailScreenshot = "readability/long-email-320.png";
        await page.screenshot({
          path: path.join(artifacts, longEmailScreenshot),
          fullPage: true,
        });
        result.screenshots.push(longEmailScreenshot);
      }
      await assertTextFullyReadable(
        dialog,
        longValues.ownerEmail,
        "long saved owner email",
        captureReadabilityFailure,
      );
      activeObservation.checks.saved_name_and_email_range_rect_readability =
        "passed";
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
    if (activeObservation) {
      if (error instanceof ReadabilityFailure) {
        activeObservation.checks.saved_name_and_email_range_rect_readability =
          "failed";
        result.readability_failure = error.details;
      } else if (activeObservation.checks.initial_dialog_focus !== "passed") {
        activeObservation.checks.initial_dialog_focus = "failed";
      } else if (
        activeObservation.checks.dialog_tab_and_shift_tab_containment !==
        "passed"
      ) {
        activeObservation.checks.dialog_tab_and_shift_tab_containment =
          "failed";
      } else if (
        activeObservation.checks.saved_name_and_email_range_rect_readability !==
        "passed"
      ) {
        activeObservation.checks.saved_name_and_email_range_rect_readability =
          "failed";
      }
    }
    throw error;
  } finally {
    aggregateNamedChecks(result);
    await browser?.close();
    server.kill("SIGTERM");
    await server.catch(() => undefined);
  }
}
async function assertReceiptBound(receipt, baseline) {
  assert.equal(
    receipt.status,
    "passed",
    "The frozen behavior receipt did not pass",
  );
  for (const [key, actual] of Object.entries(baseline)) {
    assert.equal(
      receipt[key],
      actual,
      `Frozen behavior receipt ${key} differs from this app`,
    );
  }
  assert.equal(
    await treeDigest(root, excludedInputs),
    receipt.project_input_digest,
    "Project inputs changed after frozen behavior receipt",
  );
  assert.equal(
    await treeDigest(path.join(root, "src")),
    receipt.source_digest,
    "Source changed after frozen behavior receipt",
  );
  assert.equal(
    await treeDigest(path.join(root, "node_modules")),
    receipt.dependency_cohort_digest,
    "Dependency cohort changed after frozen behavior receipt",
  );
  assert.equal(
    await treeDigest(path.join(root, "dist")),
    receipt.compiled_digest,
    "Compiled output differs from frozen behavior receipt",
  );
}

const harnessDigests = {
  supplement_script_sha256: await fileDigest(thisScript),
  retrieval_acceptance_script_sha256: await fileDigest(retrievalAcceptance),
};
// A run owns a fresh stage; earlier receipts and screenshots are immutable.
await mkdir(path.dirname(artifacts), { recursive: true });
await mkdir(artifacts);
await mkdir(readabilityArtifacts);
const baseline = {
  source_digest: await treeDigest(path.join(root, "src")),
  project_input_digest: await treeDigest(root, excludedInputs),
  dependency_cohort_digest: await treeDigest(path.join(root, "node_modules")),
};
const result = {
  status: "failed",
  check_definition: checkDefinition,
  check_definition_hash: checkDefinitionHash,
  behavior_receipt: "behavior/result.json",
  harness_digests: harnessDigests,
  original_receipt: null,
  named_checks: {
    initial_dialog_focus: "pending",
    dialog_tab_and_shift_tab_containment: "pending",
    saved_name_and_email_range_rect_readability: "pending",
  },
  viewport_observations: [],
  vertical_scroll_observations: [],
  screenshots: [],
  screenshot_errors: [],
  errors: [],
  external_requests: [],
  readability_failure: null,
  integrity_failure: null,
  harness_integrity_failure: null,
  failure: null,
};
let receipt;
let failure;
try {
  const behavior = await execa(
    process.execPath,
    [retrievalAcceptance, "--root", root, "--artifacts", behaviorArtifacts],
    {
      cwd: root,
      env: guardedEnvironment(),
      reject: false,
    },
  );
  assert.equal(
    behavior.exitCode,
    0,
    `Frozen behavior acceptance failed:\n${behavior.stdout ?? ""}\n${behavior.stderr ?? ""}`,
  );
  receipt = JSON.parse(
    await readFile(path.join(behaviorArtifacts, "result.json"), "utf8"),
  );
  result.original_receipt = receipt;
  await assertReceiptBound(receipt, baseline);
  await runReadabilityAcceptance(result);
  result.status = "passed";
} catch (error) {
  failure = error;
  result.status = "failed";
  result.failure = {
    name: error?.name ?? "Error",
    message: error?.message ?? String(error),
  };
} finally {
  if (receipt) {
    try {
      await assertReceiptBound(receipt, baseline);
    } catch (error) {
      result.status = "failed";
      result.integrity_failure = {
        name: error?.name ?? "Error",
        message: error?.message ?? String(error),
      };
      if (!failure) {
        failure = error;
        result.failure = result.integrity_failure;
      }
    }
  }
  try {
    assert.deepEqual(
      {
        supplement_script_sha256: await fileDigest(thisScript),
        retrieval_acceptance_script_sha256:
          await fileDigest(retrievalAcceptance),
      },
      harnessDigests,
      "Acceptance harness scripts changed during the supplement",
    );
  } catch (error) {
    result.status = "failed";
    result.harness_integrity_failure = {
      name: error?.name ?? "Error",
      message: error?.message ?? String(error),
    };
    if (!failure) {
      failure = error;
      result.failure = result.harness_integrity_failure;
    }
  }
  if (result.original_receipt) {
    result.source_digest = result.original_receipt.source_digest;
    result.project_input_digest = result.original_receipt.project_input_digest;
    result.dependency_cohort_digest =
      result.original_receipt.dependency_cohort_digest;
    result.compiled_digest = result.original_receipt.compiled_digest;
  }
  await writeFile(
    path.join(artifacts, "result.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
}
if (failure) throw failure;
console.log("Project launch requalification readability supplement passed.");
