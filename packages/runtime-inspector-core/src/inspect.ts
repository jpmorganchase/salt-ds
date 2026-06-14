import { inspectBrowserSession } from "./inspectBrowserSession.js";
import {
  createBaseResult,
  createUnavailableLayoutEvidence,
  getErrorMessage,
  type RuntimeInspectOptions,
  safeFetchWithTimeout,
  summarizeHtmlDocument,
} from "./inspectShared.js";
import type {
  ArtifactDescriptor,
  RuntimeErrorRecord,
  RuntimeInspectResult,
} from "./schemas.js";

export type { RuntimeInspectOptions } from "./inspectShared.js";

async function inspectFetchedHtml(
  url: string,
  options: RuntimeInspectOptions,
  notes: string[] = [],
): Promise<RuntimeInspectResult> {
  const response = await safeFetchWithTimeout(url, options.timeoutMs ?? 10_000);
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

/**
 * Inspect a URL. In `auto` mode (default) tries `playwright` first and
 * silently falls back to fetched-HTML if Playwright is not installed. In
 * `browser` mode throws on missing Playwright. In `fetched-html` mode
 * skips Playwright entirely.
 *
 * Playwright is an optional peer dependency: install it with
 * `npm install playwright` (or `yarn add playwright`) only if you want
 * browser-session evidence. The ~250 MB cost is paid only when
 * `inspectBrowserSession` actually runs.
 */
export async function inspectUrl(
  url: string,
  options: RuntimeInspectOptions = {},
): Promise<RuntimeInspectResult> {
  const mode = options.mode ?? "auto";

  if (mode === "fetched-html") {
    return inspectFetchedHtml(url, options);
  }

  try {
    return await inspectBrowserSession(url, options);
  } catch (error) {
    if (mode === "browser") {
      throw error;
    }

    return inspectFetchedHtml(url, options, [
      `Browser-session inspection was unavailable, so the inspector fell back to fetched-html mode: ${getErrorMessage(error)}`,
    ]);
  }
}
