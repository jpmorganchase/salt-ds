import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.resetModules();
});

describe("inspectUrl lazy browser-adapter loader", () => {
  it("throws with the install hint when the browser adapter cannot be resolved and --mode browser was requested", async () => {
    vi.doMock("@salt-ds/runtime-inspector-browser", () => {
      throw new Error(
        "Cannot find module '@salt-ds/runtime-inspector-browser'",
      );
    });

    const { inspectUrl, __resetBrowserInspectorCacheForTests } = await import(
      "../inspect.js"
    );
    __resetBrowserInspectorCacheForTests();

    await expect(
      inspectUrl("http://127.0.0.1/", { mode: "browser" }),
    ).rejects.toThrow(/Browser-session inspection requires Playwright/);
  });

  it("throws an install-hint that names --mode fetched-html as the alternative", async () => {
    vi.doMock("@salt-ds/runtime-inspector-browser", () => {
      throw new Error(
        "Cannot find module '@salt-ds/runtime-inspector-browser'",
      );
    });

    const { inspectUrl, __resetBrowserInspectorCacheForTests } = await import(
      "../inspect.js"
    );
    __resetBrowserInspectorCacheForTests();

    await expect(
      inspectUrl("http://127.0.0.1/", { mode: "browser" }),
    ).rejects.toThrow(/--mode fetched-html/);
  });

  it("uses the bundled browser adapter when it resolves successfully", async () => {
    const stubResult = {
      toolVersion: "test",
      timestamp: "2026-03-25T12:00:00Z",
      inspectionMode: "browser-session" as const,
      notes: [],
      target: { url: "http://localhost/" },
      page: {
        title: "stub",
        loadState: "load",
        statusCode: 200,
        contentType: "text/html",
      },
      errors: [],
      accessibility: { roles: [], landmarks: [] },
      structure: { summary: [] },
      layout: {
        available: true as const,
        mode: "computed-style" as const,
        hints: [],
        nodes: [],
      },
      screenshots: [],
      artifacts: [],
    };
    const inspectBrowserSession = vi.fn(async () => stubResult);
    vi.doMock("@salt-ds/runtime-inspector-browser", () => ({
      inspectBrowserSession,
    }));

    const { inspectUrl, __resetBrowserInspectorCacheForTests } = await import(
      "../inspect.js"
    );
    __resetBrowserInspectorCacheForTests();

    const result = await inspectUrl("http://localhost/", {
      mode: "browser",
    });

    expect(inspectBrowserSession).toHaveBeenCalledTimes(1);
    expect(result.inspectionMode).toBe("browser-session");
  });
});

