import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const fixtureDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(fixtureDir, "../..");
const chromePath =
  process.env.CHROME_PATH ??
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);

const files = {
  initial: "orders-app.runtime.html",
  fixed: "orders-app.runtime.fixed.html",
  hostile: "orders-app.runtime.hostile.html",
};

function resolveBrowserLaunchOptions() {
  if (chromePath && existsSync(chromePath)) {
    return { executablePath: chromePath, headless: true };
  }

  return { headless: true };
}

function startServer() {
  const server = http.createServer(async (request, response) => {
    const requested =
      decodeURIComponent((request.url ?? "/").replace(/^\//, "")) ??
      files.initial;
    const file = Object.values(files).includes(requested)
      ? requested
      : files.initial;
    const html = await readFile(path.join(fixtureDir, file), "utf8");

    response.writeHead(200, { "content-type": "text/html" });
    response.end(html);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function inspectFixture(browser, baseUrl, name, file) {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 768 },
  });
  const url = `${baseUrl}/${file}`;
  const response = await page.goto(url, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => {
    function boxFor(selector) {
      const element = document.querySelector(selector);
      if (!element) {
        return null;
      }

      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        selector,
        text: element.textContent?.trim().replace(/\s+/g, " ") ?? "",
        box: {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        },
        display: style.display,
        gap: style.gap,
      };
    }

    const landmarks = Array.from(
      document.querySelectorAll('header, nav, main, [role="region"]'),
    ).map((element) => {
      const tag = element.tagName.toLowerCase();
      const role =
        element.getAttribute("role") ??
        (tag === "nav" ? "navigation" : tag === "main" ? "main" : "banner");
      const label = element.getAttribute("aria-label");

      return `${role}${label ? `:${label}` : ""}`;
    });

    return {
      title: document.title,
      bodyText: document.body.textContent?.trim().replace(/\s+/g, " ") ?? "",
      landmarks,
      buttons: Array.from(document.querySelectorAll("button")).map((button) =>
        button.textContent?.trim(),
      ),
      hasNamedMain: Boolean(
        document.querySelector('main[aria-label="Orders workspace"]'),
      ),
      hasActionRegion: Boolean(
        document.querySelector('[role="region"][aria-label="Order actions"]'),
      ),
      layout: [
        boxFor("#app"),
        boxFor("main"),
        boxFor(".actions"),
        boxFor("button"),
      ].filter(Boolean),
    };
  });

  await page.close();

  return {
    name,
    url,
    status: response?.status() ?? null,
    ...result,
  };
}

const server = await startServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch(resolveBrowserLaunchOptions());

try {
  const initial = await inspectFixture(
    browser,
    baseUrl,
    "initial",
    files.initial,
  );
  const fixed = await inspectFixture(browser, baseUrl, "fixed", files.fixed);
  const hostile = await inspectFixture(
    browser,
    baseUrl,
    "hostile",
    files.hostile,
  );

  console.log(
    JSON.stringify(
      {
        repoRoot,
        baseUrl,
        initial,
        fixed,
        hostile,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  server.close();
}
