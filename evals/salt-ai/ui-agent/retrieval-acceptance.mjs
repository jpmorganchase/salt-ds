import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { execa } from "execa";
import { chromium } from "playwright";

// Frozen before the native output. This checks the user journey, not a JSX tree
// or a universal rule about which buttons may appear in dialog content.
// The aggregate report records later corrections to asynchronous close/focus
// waits; the task requirements and expected outcomes did not change.
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
await mkdir(artifacts, { recursive: true });
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
const sourceDigest = await treeDigest(path.join(root, "src"));
const dependencyCohortDigest = await treeDigest(
  path.join(root, "node_modules"),
);
// Bind all mutable project inputs, including Vite config, public assets and
// manifests. Dependencies are the separately prepared exact package cohort.
const excludedInputs = new Set([
  "node_modules",
  ".git",
  "dist",
  ".evidence",
  ".tools",
]);
const projectInputDigest = await treeDigest(root, excludedInputs);
// Build here so a caller cannot pass stale dist output under a new source hash.
await execa(
  process.execPath,
  [path.join(root, "node_modules/vite/bin/vite.js"), "build"],
  {
    cwd: root,
    stdio: "inherit",
  },
);
assert.equal(
  await treeDigest(root, excludedInputs),
  projectInputDigest,
  "Project inputs changed during the build",
);
const compiledDigest = await treeDigest(path.join(root, "dist"));
const socket = net.createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const url = `http://127.0.0.1:${port}`;
const server = execa(
  process.execPath,
  [
    path.join(root, "node_modules/vite/bin/vite.js"),
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  { cwd: root, reject: false },
);
let browser;
const errors = [];
const externalRequests = [];
const screenshots = [];
try {
  const deadline = Date.now() + 30_000;
  while (true) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {
      /* starting */
    }
    assert(Date.now() < deadline, "Preview did not start");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const width of [1280, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      serviceWorkers: "block",
    });
    await context.routeWebSocket("**/*", async (socket) => {
      const request = new URL(socket.url());
      if (["127.0.0.1", "localhost", "[::1]"].includes(request.hostname)) {
        socket.connectToServer();
      } else {
        externalRequests.push(request.href);
        await socket.close();
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await context.route("**/*", async (route) => {
      const request = new URL(route.request().url());
      if (
        ["data:", "blob:"].includes(request.protocol) ||
        ["127.0.0.1", "localhost", "[::1]"].includes(request.hostname)
      ) {
        await route.continue();
      } else {
        externalRequests.push(request.href);
        await route.abort();
      }
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.addScriptTag({
      content: await readFile(require.resolve("axe-core/axe.min.js"), "utf8"),
    });
    const activate = async (locator) => {
      await locator.focus();
      await locator.press("Enter");
    };
    const navigate = async (name) => {
      const item = page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name, exact: true });
      await activate(item);
      await page.waitForFunction(
        (fragment) => location.hash === fragment,
        `#${name.toLowerCase()}`,
      );
      assert.equal(await item.getAttribute("aria-current"), "page");
    };
    const inspect = async (state) => {
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          document
            .getAnimations()
            .filter((a) =>
              Number.isFinite(a.effect?.getComputedTiming().endTime),
            )
            .map((a) => a.finished.catch(() => {})),
        );
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      });
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
      const name = `${width}-${state}.png`;
      await page.screenshot({
        path: path.join(artifacts, name),
        fullPage: true,
      });
      screenshots.push(name);
    };
    const name = page.getByRole("textbox", {
      name: "Project name",
      exact: true,
    });
    const email = page.getByRole("textbox", {
      name: "Owner email",
      exact: true,
    });
    const preview = page.getByRole("button", {
      name: "Preview launch",
      exact: true,
    });
    const assertPreviewFocused = async () => {
      const button = await preview.elementHandle();
      assert(button, "Preview launch is mounted");
      try {
        await page.waitForFunction(
          (element) => element === document.activeElement,
          button,
        );
      } finally {
        await button.dispose();
      }
    };
    const assertPreviewUnavailable = async () => {
      assert(
        (await preview.count()) === 0 ||
          !(await preview.isVisible()) ||
          (await preview.isDisabled()),
        "Preview launch must remain unavailable until a valid save",
      );
    };
    await assertPreviewUnavailable();
    await email.fill("planner@example.com");
    await activate(
      page.getByRole("button", { name: "Save project", exact: true }),
    );
    assert.equal(
      await page.getByText("Project settings saved.", { exact: true }).count(),
      0,
    );
    await assertPreviewUnavailable();
    await name.fill("Quarterly planning");
    await email.fill("unfinished");
    await navigate("Team");
    assert.equal(
      await name.isVisible(),
      false,
      "Team is a separate destination",
    );
    const teamContent = (await page.getByRole("main").innerText()).trim();
    await navigate("Settings");
    assert.equal(
      await name.isVisible(),
      false,
      "Settings is a separate destination",
    );
    const settingsContent = (await page.getByRole("main").innerText()).trim();
    assert.notEqual(
      teamContent,
      settingsContent,
      "Team and Settings present distinct content",
    );
    const assertHistoryDestination = async (destination, content) => {
      await page.waitForFunction(
        ({ destination, content }) =>
          location.hash === `#${destination.toLowerCase()}` &&
          document.querySelector("main")?.innerText.trim() === content &&
          document
            .querySelector(
              'nav[aria-label="Primary navigation"] a[aria-current="page"]',
            )
            ?.textContent.trim() === destination,
        { destination, content },
      );
    };
    await page.goBack();
    await assertHistoryDestination("Team", teamContent);
    await page.goForward();
    await assertHistoryDestination("Settings", settingsContent);
    await navigate("Overview");
    assert.equal(await name.inputValue(), "Quarterly planning");
    assert.equal(await email.inputValue(), "unfinished");
    await activate(
      page.getByRole("button", { name: "Save project", exact: true }),
    );
    assert.equal(
      await page.getByText("Project settings saved.", { exact: true }).count(),
      0,
    );
    await assertPreviewUnavailable();
    await email.fill("planner@example.com");
    await activate(
      page.getByRole("button", { name: "Save project", exact: true }),
    );
    await page.getByText("Project settings saved.", { exact: true }).waitFor();
    await navigate("Team");
    await page.getByText("planner@example.com", { exact: true }).waitFor();
    await navigate("Overview");
    await name.fill("Unsaved next draft");
    await activate(preview);
    let dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await activate(
      dialog.getByRole("button", { name: "Show review details", exact: true }),
    );
    await dialog.getByText("Quarterly planning", { exact: true }).waitFor();
    await dialog.getByText("planner@example.com", { exact: true }).waitFor();
    assert.equal(
      await dialog.getByText("Unsaved next draft", { exact: true }).count(),
      0,
    );
    await inspect("review-details");
    await activate(
      dialog.getByRole("button", { name: "Hide review details", exact: true }),
    );
    await activate(
      dialog.getByRole("button", { name: "Show review details", exact: true }),
    );
    await activate(dialog.getByRole("button", { name: "Cancel", exact: true }));
    await dialog.waitFor({ state: "hidden" });
    await assertPreviewFocused();
    assert.equal(
      await page.getByText("Project launched", { exact: true }).count(),
      0,
    );
    await activate(preview);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await assertPreviewFocused();
    assert.equal(
      await page.getByText("Project launched", { exact: true }).count(),
      0,
      "Escape must leave launch status unchanged",
    );
    for (let attempt = 0; attempt < 2; attempt++) {
      await activate(preview);
      dialog = page.getByRole("dialog");
      await activate(
        dialog.getByRole("button", { name: "Launch project", exact: true }),
      );
      await dialog.waitFor({ state: "hidden" });
      assert.equal(
        await page.getByText("Project launched", { exact: true }).count(),
        1,
      );
    }
    await activate(preview);
    await activate(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Cancel", exact: true }),
    );
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await assertPreviewFocused();
    await navigate("Settings");
    await page.getByText("Project launched", { exact: true }).waitFor();
    await navigate("Overview");
    assert.equal(await name.inputValue(), "Unsaved next draft");
    await inspect("launched");
    await activate(page.getByTestId("mode-toggle"));
    assert.equal(
      await page.locator(".appShell").getAttribute("data-mode"),
      "dark",
    );
    await inspect("dark");
    await activate(page.getByTestId("density-toggle"));
    assert.equal(
      await page.locator(".appShell").getAttribute("data-density"),
      "high",
    );
    await inspect("high-density");
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  assert.equal(
    await treeDigest(root, excludedInputs),
    projectInputDigest,
    "Project inputs changed during acceptance",
  );
  assert.equal(
    await treeDigest(path.join(root, "src")),
    sourceDigest,
    "Source changed during acceptance",
  );
  assert.equal(
    await treeDigest(path.join(root, "dist")),
    compiledDigest,
    "Compiled output changed during acceptance",
  );
  assert.equal(
    await treeDigest(path.join(root, "node_modules")),
    dependencyCohortDigest,
    "Installed dependency cohort changed during acceptance",
  );
  await writeFile(
    path.join(artifacts, "result.json"),
    `${JSON.stringify({ status: "passed", source_digest: sourceDigest, project_input_digest: projectInputDigest, dependency_cohort_digest: dependencyCohortDigest, compiled_digest: compiledDigest, screenshots, errors, external_requests: externalRequests }, null, 2)}\n`,
  );
  console.log(
    "Project launch retrieval exercise passed at desktop and 320 CSS pixels.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await server;
}
