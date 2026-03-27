import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectUrl } from "../inspect.js";

const tempDirs: string[] = [];

function startServer(
  html: string,
  statusCode = 200,
  contentType = "text/html; charset=utf-8",
): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve) => {
    const server = http.createServer((_request, response) => {
      response.writeHead(statusCode, { "content-type": contentType });
      response.end(html);
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address && typeof address === "object") {
        resolve({
          server,
          url: `http://127.0.0.1:${address.port}/`,
        });
      }
    });
  });
}

async function closeServer(server: http.Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(tempDir);
  return tempDir;
}

let browserAvailabilityPromise: Promise<boolean> | null = null;

function canLaunchBrowser(): Promise<boolean> {
  browserAvailabilityPromise ??= (async () => {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      await browser.close();
      return true;
    } catch {
      return false;
    }
  })();

  return browserAvailabilityPromise;
}

let activeServer: http.Server | null = null;

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
  if (activeServer) {
    await closeServer(activeServer);
    activeServer = null;
  }
});

describe("inspectUrl", () => {
  it("extracts fetched-html evidence from a page", async () => {
    const serverInfo = await startServer(`
      <!doctype html>
      <html>
        <head><title>Runtime Demo</title></head>
        <body>
          <header><a href="/home">Home</a></header>
          <main>
            <form aria-label="Settings form">
              <button aria-label="Save">Save</button>
            </form>
          </main>
        </body>
      </html>
    `);
    activeServer = serverInfo.server;

    const result = await inspectUrl(serverInfo.url, {
      mode: "fetched-html",
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.inspectionMode).toBe("fetched-html");
    expect(result.page.title).toBe("Runtime Demo");
    expect(result.page.statusCode).toBe(200);
    expect(
      result.accessibility.roles.some((entry) => entry.role === "button"),
    ).toBe(true);
    expect(
      result.accessibility.landmarks.some((entry) => entry.role === "main"),
    ).toBe(true);
    expect(
      result.structure.summary.some((entry) => entry.includes("main")),
    ).toBe(true);
    expect(result.layout.available).toBe(false);
    expect(result.layout.mode).toBe("unavailable");
    expect(
      result.layout.hints.some((hint) =>
        hint.includes(
          "Computed layout evidence is unavailable in fetched-html mode",
        ),
      ),
    ).toBe(true);
    expect(result.screenshots).toEqual([]);
    expect(result.notes).toEqual([]);
  });

  it("surfaces HTTP errors in the result payload", async () => {
    const serverInfo = await startServer(
      "<html><head><title>Nope</title></head></html>",
      404,
    );
    activeServer = serverInfo.server;

    const result = await inspectUrl(serverInfo.url, {
      mode: "fetched-html",
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.page.statusCode).toBe(404);
    expect(result.errors.some((error) => error.kind === "http")).toBe(true);
  });

  it("captures browser-session evidence including screenshots and console errors", async (context) => {
    if (!(await canLaunchBrowser())) {
      context.skip();
      return;
    }

    const outputDir = await createTempDir("salt-runtime-browser");
    const serverInfo = await startServer(`
      <!doctype html>
      <html>
        <head>
          <title>Initial Title</title>
          <style>
            .shell {
              display: flex;
              justify-content: center;
            }

            nav {
              display: flex;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <nav aria-label="Primary navigation" id="top-nav"></nav>
          </div>
          <main id="app"></main>
          <script>
            document.title = "Hydrated Title";
            document.getElementById("app").innerHTML = '<button aria-label="Save Changes">Save</button>';
            console.error("Runtime boom");
          </script>
        </body>
      </html>
    `);
    activeServer = serverInfo.server;

    const result = await inspectUrl(serverInfo.url, {
      mode: "browser",
      outputDir,
      timeoutMs: 15000,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.inspectionMode).toBe("browser-session");
    expect(result.page.title).toBe("Hydrated Title");
    expect(result.errors.some((error) => error.kind === "console")).toBe(true);
    expect(
      result.accessibility.roles.some(
        (entry) => entry.role === "button" && entry.name === "Save Changes",
      ),
    ).toBe(true);
    expect(result.layout.available).toBe(true);
    expect(result.layout.mode).toBe("computed-style");
    expect(result.layout.nodes.length).toBeGreaterThan(0);
    expect(
      result.layout.nodes.some(
        (node) =>
          node.selector.includes("nav#top-nav") &&
          node.computedStyle.display === "flex" &&
          node.ancestorChain.some(
            (ancestor) =>
              ancestor.selector.includes("div.shell") &&
              ancestor.computedStyle.justifyContent === "center",
          ),
      ),
    ).toBe(true);
    expect(result.layout.hints.some((hint) => hint.includes("center"))).toBe(
      true,
    );
    expect(result.screenshots.length).toBeGreaterThan(0);
    await expect(
      fs.access(result.screenshots[0]?.path ?? ""),
    ).resolves.toBeUndefined();
    expect(result.notes).toEqual([]);
  }, 20000);
});
