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
const scopeArtifacts = path.join(artifacts, "scope");
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
  contract: "salt-ui-project-launch-scope-acceptance/1",
  prerequisite: "requalification-acceptance.mjs unchanged and passed first",
  viewports: [1280, 320],
  checks: [
    "pilot-default-and-visible-radio-group",
    "keyboard-scope-switching",
    "draft-navigation-round-trip",
    "invalid-save-preserves-saved-scope",
    "expanded-review-shows-saved-scope",
    "cancel-and-escape-preserve-launched-scope",
    "settings-launch-scope-lifecycle",
    "repeat-launch-has-one-status-and-summary",
    "labelled-images-accessibility-and-readability",
  ],
  visible_text_rule:
    "Launch scope, Pilot, Full rollout, and launched scope summaries must be labelled, visible, readable, keyboard operable, and fit the viewport without horizontal clipping.",
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
function radio(page, name) {
  return page.getByRole("radio", { name, exact: true });
}
async function assertScopeSelection(pilot, rollout, selected) {
  assert.equal(
    await pilot.isChecked(),
    selected === "Pilot",
    `Pilot checked state after selecting ${selected}`,
  );
  assert.equal(
    await rollout.isChecked(),
    selected === "Full rollout",
    `Full rollout checked state after selecting ${selected}`,
  );
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
async function inspect(page, result, width, state) {
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
  const screenshot = `scope/${width}-${state}.png`;
  await page.screenshot({
    path: path.join(artifacts, screenshot),
    fullPage: true,
  });
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

async function runScopeAcceptance(result) {
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
  try {
    await waitForServer(url);
    browser = await chromium.launch({ channel: "chrome", headless: true });
    for (const width of [1280, 320]) {
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
      await page.addScriptTag({
        content: await readFile(require.resolve("axe-core/axe.min.js"), "utf8"),
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
      const pilot = radio(page, "Pilot");
      const rollout = radio(page, "Full rollout");
      const scopeGroup = page
        .getByRole("group", { name: "Launch scope", exact: true })
        .or(
          page.getByRole("radiogroup", { name: "Launch scope", exact: true }),
        );
      await pilot.waitFor();
      await rollout.waitFor();
      assert.equal(
        await scopeGroup.count(),
        1,
        "Launch scope has one accessible labelled group",
      );
      assert.equal(
        await scopeGroup
          .getByRole("radio", { name: "Pilot", exact: true })
          .count(),
        1,
        "Pilot belongs to the accessible Launch scope group",
      );
      assert.equal(
        await scopeGroup
          .getByRole("radio", { name: "Full rollout", exact: true })
          .count(),
        1,
        "Full rollout belongs to the accessible Launch scope group",
      );
      assert.equal(
        await pilot.isChecked(),
        true,
        "Pilot is initially selected",
      );
      assert.equal(
        await rollout.isChecked(),
        false,
        "Full rollout is initially unselected",
      );
      assert.equal(await pilot.count(), 1);
      assert.equal(await rollout.count(), 1);
      await assertReadable(page, "Launch scope");
      await assertReadable(page, "Pilot");
      await assertReadable(page, "Full rollout");
      await inspect(page, result, width, "form-pilot");
      await pilot.focus();
      await page.keyboard.press("ArrowRight");
      await assertScopeSelection(pilot, rollout, "Full rollout");
      await page.keyboard.press("ArrowLeft");
      await assertScopeSelection(pilot, rollout, "Pilot");
      await rollout.check();
      await assertScopeSelection(pilot, rollout, "Full rollout");
      await assertReadable(page, "Pilot");
      await assertReadable(page, "Full rollout");
      await inspect(page, result, width, "form-full-rollout");
      await navigate(page, "Team");
      await navigate(page, "Settings");
      await navigate(page, "Overview");
      assert.equal(
        await rollout.isChecked(),
        true,
        "Changed draft scope survives navigation round-trip",
      );
      await name.fill("Quarterly planning");
      await email.fill("planner@example.com");
      await activate(save);
      await page
        .getByText("Project settings saved.", { exact: true })
        .waitFor();
      await name.fill("Invalid scope snapshot");
      await email.fill("invalid");
      await pilot.check();
      await assertScopeSelection(pilot, rollout, "Pilot");
      await activate(save);
      assert.equal(
        await page
          .getByText("Project settings saved.", { exact: true })
          .count(),
        0,
        "Invalid save cannot report success",
      );
      await activate(preview);
      let dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await activate(
        dialog.getByRole("button", {
          name: "Show review details",
          exact: true,
        }),
      );
      await dialog.getByText("Quarterly planning", { exact: true }).waitFor();
      await dialog.getByText("planner@example.com", { exact: true }).waitFor();
      await dialog.getByText("Launch scope", { exact: true }).waitFor();
      await dialog.getByText("Full rollout", { exact: true }).waitFor();
      await assertReadable(page, "Launch scope", dialog);
      await assertReadable(page, "Full rollout", dialog);
      assert.equal(
        await dialog.getByText("Pilot", { exact: true }).count(),
        0,
        "Invalid draft scope must not replace saved review scope",
      );
      await inspect(page, result, width, "review-full-rollout");
      await activate(
        dialog.getByRole("button", { name: "Cancel", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      await navigate(page, "Settings");
      assert.equal(
        await page.getByText(/^Launched scope:/).count(),
        0,
        "Settings has no launched scope before first launch",
      );
      await navigate(page, "Overview");
      await name.fill("Quarterly planning");
      await email.fill("planner@example.com");
      await rollout.check();
      await assertScopeSelection(pilot, rollout, "Full rollout");
      await activate(save);
      await page
        .getByText("Project settings saved.", { exact: true })
        .waitFor();
      await pilot.check();
      await assertScopeSelection(pilot, rollout, "Pilot");
      await activate(preview);
      dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await activate(
        dialog.getByRole("button", {
          name: "Show review details",
          exact: true,
        }),
      );
      await dialog.getByText("Launch scope", { exact: true }).waitFor();
      await dialog.getByText("Full rollout", { exact: true }).waitFor();
      await assertReadable(page, "Launch scope", dialog);
      await assertReadable(page, "Full rollout", dialog);
      assert.equal(
        await dialog.getByText("Pilot", { exact: true }).count(),
        0,
        "Unsaved Pilot draft must not replace the Full rollout launch snapshot",
      );
      await inspect(page, result, width, "review-saved-full-rollout");
      await activate(
        dialog.getByRole("button", { name: "Launch project", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      await page.getByText("Project launched", { exact: true }).waitFor();
      assert.equal(
        await page.getByText("Project launched", { exact: true }).count(),
        1,
        "Overview has one launch status after Full rollout launch",
      );
      await navigate(page, "Settings");
      await page.getByText("Project launched", { exact: true }).waitFor();
      await page
        .getByText("Launched scope: Full rollout", { exact: true })
        .waitFor();
      await assertReadable(page, "Launched scope: Full rollout");
      await inspect(page, result, width, "settings-full-rollout");
      await navigate(page, "Overview");
      await pilot.check();
      await assertScopeSelection(pilot, rollout, "Pilot");
      await activate(save);
      await page
        .getByText("Project settings saved.", { exact: true })
        .waitFor();
      await navigate(page, "Settings");
      assert.equal(
        await page
          .getByText("Launched scope: Full rollout", { exact: true })
          .count(),
        1,
        "Saving a later draft does not rewrite launched scope",
      );
      await navigate(page, "Overview");
      await activate(preview);
      dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await activate(
        dialog.getByRole("button", { name: "Cancel", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      await navigate(page, "Settings");
      assert.equal(
        await page
          .getByText("Launched scope: Full rollout", { exact: true })
          .count(),
        1,
        "Cancelled review preserves prior launched scope",
      );
      await navigate(page, "Overview");
      await activate(preview);
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await navigate(page, "Settings");
      assert.equal(
        await page
          .getByText("Launched scope: Full rollout", { exact: true })
          .count(),
        1,
        "Escape preserves prior launched scope",
      );
      await navigate(page, "Overview");
      await activate(preview);
      dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await activate(
        dialog.getByRole("button", {
          name: "Show review details",
          exact: true,
        }),
      );
      await dialog.getByText("Launch scope", { exact: true }).waitFor();
      await dialog.getByText("Pilot", { exact: true }).waitFor();
      await assertReadable(page, "Launch scope", dialog);
      await assertReadable(page, "Pilot", dialog);
      await inspect(page, result, width, "review-pilot");
      await activate(
        dialog.getByRole("button", { name: "Launch project", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      await page.getByText("Project launched", { exact: true }).waitFor();
      assert.equal(
        await page.getByText("Project launched", { exact: true }).count(),
        1,
        "Overview has one launch status after Pilot launch",
      );
      await navigate(page, "Settings");
      await page.getByText("Launched scope: Pilot", { exact: true }).waitFor();
      assert.equal(
        await page.getByText(/^Launched scope:/).count(),
        1,
        "Later launch leaves one launched-scope summary",
      );
      assert.equal(
        await page
          .getByText("Launched scope: Full rollout", { exact: true })
          .count(),
        0,
        "Later launch removes the prior launched-scope summary",
      );
      assert.equal(
        await page.getByText("Project launched", { exact: true }).count(),
        1,
        "Later launch has one status",
      );
      await assertReadable(page, "Launched scope: Pilot");
      await inspect(page, result, width, "settings-pilot");
      await navigate(page, "Overview");
      await activate(preview);
      dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await activate(
        dialog.getByRole("button", { name: "Launch project", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      await page.getByText("Project launched", { exact: true }).waitFor();
      assert.equal(
        await page.getByText("Project launched", { exact: true }).count(),
        1,
        "Overview still has one launch status after repeated launch",
      );
      await navigate(page, "Settings");
      assert.equal(
        await page.getByText("Launched scope: Pilot", { exact: true }).count(),
        1,
        "Repeated launch has one launched-scope summary",
      );
      assert.equal(
        await page.getByText("Project launched", { exact: true }).count(),
        1,
        "Repeated launch has one status",
      );
      await navigate(page, "Overview");
      await page.getByTestId("mode-toggle").click();
      await scopeGroup.waitFor();
      await assertReadable(page, "Launch scope");
      await assertReadable(page, "Pilot");
      await assertReadable(page, "Full rollout");
      await inspect(page, result, width, "dark-form-pilot");
      await page.getByTestId("density-toggle").click();
      await scopeGroup.waitFor();
      await assertReadable(page, "Launch scope");
      await assertReadable(page, "Pilot");
      await assertReadable(page, "Full rollout");
      await inspect(page, result, width, "high-density-form-pilot");
      await activate(preview);
      dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await activate(
        dialog.getByRole("button", {
          name: "Show review details",
          exact: true,
        }),
      );
      await dialog.getByText("Launch scope", { exact: true }).waitFor();
      await dialog.getByText("Pilot", { exact: true }).waitFor();
      await assertReadable(page, "Launch scope", dialog);
      await assertReadable(page, "Pilot", dialog);
      await inspect(page, result, width, "high-density-review-pilot");
      await activate(
        dialog.getByRole("button", { name: "Cancel", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      await navigate(page, "Settings");
      await assertReadable(page, "Launched scope: Pilot");
      await inspect(page, result, width, "high-density-settings-pilot");
      result.viewport_observations.push({ width, status: "passed" });
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
    const screenshot = "scope/failure.png";
    if (page) {
      try {
        await page.screenshot({
          path: path.join(artifacts, screenshot),
          fullPage: true,
        });
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
    throw error;
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
    await server.catch(() => undefined);
  }
}

const harnessDigests = {
  supplement_script_sha256: await fileDigest(thisScript),
  requalification_acceptance_script_sha256: await fileDigest(requalification),
  retrieval_acceptance_script_sha256: await fileDigest(retrieval),
};
await mkdir(path.dirname(artifacts), { recursive: true });
await mkdir(artifacts); // A new stage is required: do not overwrite prior receipts or images.
await mkdir(scopeArtifacts);
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
  viewport_observations: [],
  screenshots: [],
  screenshot_errors: [],
  errors: [],
  external_requests: [],
  integrity_failure: null,
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
  await assertReceiptBound(receipt, baseline);
  await runScopeAcceptance(result);
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
console.log("Project launch scope acceptance supplement passed.");
