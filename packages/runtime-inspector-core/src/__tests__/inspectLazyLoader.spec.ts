import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.doUnmock("playwright");
});

beforeEach(() => {
  vi.resetModules();
});

describe("inspectUrl lazy Playwright loader", () => {
  it("throws with the install hint when playwright cannot be resolved and --mode browser was requested", async () => {
    vi.doMock("playwright", () => {
      throw new Error("Cannot find module 'playwright'");
    });

    const { inspectUrl } = await import("../inspect.js");

    await expect(
      inspectUrl("http://127.0.0.1/", { mode: "browser" }),
    ).rejects.toThrow(
      /Browser-session inspection requires the optional `playwright` peer dependency/,
    );
  });

  it("install hint names --mode fetched-html as the alternative", async () => {
    vi.doMock("playwright", () => {
      throw new Error("Cannot find module 'playwright'");
    });

    const { inspectUrl } = await import("../inspect.js");

    await expect(
      inspectUrl("http://127.0.0.1/", { mode: "browser" }),
    ).rejects.toThrow(/--mode fetched-html/);
  });

  it("calls the bundled inspectBrowserSession adapter when playwright resolves", async () => {
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
    vi.doMock("../inspectBrowserSession.js", () => ({
      inspectBrowserSession,
    }));

    const { inspectUrl } = await import("../inspect.js");

    const result = await inspectUrl("http://localhost/", {
      mode: "browser",
    });

    expect(inspectBrowserSession).toHaveBeenCalledTimes(1);
    expect(result.inspectionMode).toBe("browser-session");
  });
});
