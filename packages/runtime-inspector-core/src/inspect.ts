import type {
  ArtifactDescriptor,
  RuntimeErrorRecord,
  RuntimeInspectResult,
} from "./schemas.js";
import {
  createBaseResult,
  createUnavailableLayoutEvidence,
  getErrorMessage,
  type RuntimeInspectOptions,
  summarizeHtmlDocument,
} from "./inspectShared.js";

export type { RuntimeInspectOptions } from "./inspectShared.js";

const BROWSER_INSPECTOR_PACKAGE = "@salt-ds/runtime-inspector-browser";

const BROWSER_INSTALL_HINT =
  "Browser-session inspection requires Playwright. Install it with `npm install playwright` (or `yarn add playwright`), then rerun. To skip browser inspection, use `--mode fetched-html`.";

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function inspectFetchedHtml(
  url: string,
  options: RuntimeInspectOptions,
  notes: string[] = [],
): Promise<RuntimeInspectResult> {
  const response = await fetchWithTimeout(url, options.timeoutMs ?? 10_000);
  const html = await response.text();
  const summarized = summarizeHtmlDocument(html);
  const errors: RuntimeErrorRecord[] = [];
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    errors.push({
      kind: "http",
      level: "error",
      message: `HTTP ${response.status} returned from ${response.url}`,
    });
  }

  if (!contentType.toLowerCase().includes("html")) {
    errors.push({
      kind: "content-type",
      level: "warn",
      message: `Expected HTML content but received '${contentType || "unknown"}'`,
    });
  }

  return createBaseResult(options, {
    inspectionMode: "fetched-html",
    notes,
    target: {
      url: response.url,
    },
    page: {
      title: summarized.title,
      loadState: "fetched-html",
      statusCode: response.status,
      contentType,
    },
    errors,
    accessibility: {
      roles: summarized.roles,
      landmarks: summarized.landmarks,
    },
    structure: {
      summary: summarized.structure,
    },
    layout: createUnavailableLayoutEvidence(),
    screenshots: [],
    artifacts: [] satisfies ArtifactDescriptor[],
  });
}

type BrowserInspectFn = (
  url: string,
  options: RuntimeInspectOptions,
) => Promise<RuntimeInspectResult>;

type BrowserInspectorLoadResult =
  | { ok: true; inspect: BrowserInspectFn }
  | { ok: false; error: unknown };

let cachedBrowserInspector: BrowserInspectorLoadResult | null = null;

async function loadBrowserInspector(): Promise<BrowserInspectorLoadResult> {
  if (cachedBrowserInspector) {
    return cachedBrowserInspector;
  }

  try {
    // Literal import specifier so:
    // 1. Rollup (with @salt-ds/runtime-inspector-browser in
    //    publishBundledWorkspaceDependencies for @salt-ds/cli and
    //    @salt-ds/mcp) bundles the adapter source as a preserved sibling
    //    module and rewrites this dynamic import to the relative path —
    //    consumers do not need a second `npm install` to get browser-mode
    //    code, only `playwright` itself if they want to use it.
    // 2. Vitest's vi.doMock can intercept this site for the lazy-loader
    //    unit tests in inspectLazyLoader.spec.ts.
    // Playwright remains lazy-required from inside the browser adapter so
    // its ~250 MB cost only materialises when --mode browser actually runs.
    const browserModule = (await import(
      "@salt-ds/runtime-inspector-browser"
    )) as {
      inspectBrowserSession?: BrowserInspectFn;
    };

    if (typeof browserModule.inspectBrowserSession !== "function") {
      cachedBrowserInspector = {
        ok: false,
        error: new Error(
          `${BROWSER_INSPECTOR_PACKAGE} did not export inspectBrowserSession`,
        ),
      };
      return cachedBrowserInspector;
    }

    cachedBrowserInspector = {
      ok: true,
      inspect: browserModule.inspectBrowserSession,
    };
  } catch (error) {
    cachedBrowserInspector = { ok: false, error };
  }

  return cachedBrowserInspector;
}

/**
 * Test-only hook: clear the memoised browser-adapter lookup so a fresh
 * dynamic import can be observed. Not part of the public surface.
 */
export function __resetBrowserInspectorCacheForTests(): void {
  cachedBrowserInspector = null;
}

function describeMissingBrowserAdapter(error: unknown): string {
  const detail = getErrorMessage(error);
  return `${BROWSER_INSTALL_HINT} (detail: ${detail})`;
}

export async function inspectUrl(
  url: string,
  options: RuntimeInspectOptions = {},
): Promise<RuntimeInspectResult> {
  const mode = options.mode ?? "auto";

  if (mode === "fetched-html") {
    return inspectFetchedHtml(url, options);
  }

  const browserInspector = await loadBrowserInspector();

  if (!browserInspector.ok) {
    if (mode === "browser") {
      throw new Error(describeMissingBrowserAdapter(browserInspector.error));
    }

    return inspectFetchedHtml(url, options, [
      `Browser-session inspection was unavailable, so the inspector fell back to fetched-html mode: ${describeMissingBrowserAdapter(browserInspector.error)}`,
    ]);
  }

  try {
    return await browserInspector.inspect(url, options);
  } catch (error) {
    if (mode === "browser") {
      throw error;
    }

    return inspectFetchedHtml(url, options, [
      `Browser-session inspection was unavailable, so the inspector fell back to fetched-html mode: ${getErrorMessage(error)}`,
    ]);
  }
}


