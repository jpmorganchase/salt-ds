import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { computeAccessibleName } from "dom-accessibility-api";
import { JSDOM } from "jsdom";
import type {
  RoleSummary,
  RuntimeErrorRecord,
  RuntimeInspectResult,
} from "./schemas.js";

/**
 * Shared helpers and types used by both the fetched-HTML inspector and
 * the optional Playwright browser-session inspector. Internal to this
 * package; not a stable public API.
 */

export interface RuntimeInspectOptions {
  mode?: "auto" | "browser" | "fetched-html";
  timeoutMs?: number;
  timestamp?: string;
  toolVersion?: string;
  outputDir?: string;
  captureScreenshot?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface BrowserLayoutPage {
  evaluate<T>(pageFunction: () => T): Promise<T>;
}

const LANDMARK_ROLES: ReadonlySet<string> = new Set([
  "banner",
  "complementary",
  "contentinfo",
  "form",
  "main",
  "navigation",
  "region",
  "search",
]);

export const DEFAULT_VIEWPORT = {
  width: 1440,
  height: 900,
} as const;

const FETCHED_HTML_LAYOUT_HINT =
  "Computed layout evidence is unavailable in fetched-html mode. Use browser-session inspection for bounding boxes, computed styles, and flex/grid ancestry.";

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function inferImplicitRole(element: Element): string | null {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case "a":
      return element.hasAttribute("href") ? "link" : null;
    case "button":
      return "button";
    case "main":
      return "main";
    case "nav":
      return "navigation";
    case "header":
      return "banner";
    case "footer":
      return "contentinfo";
    case "aside":
      return "complementary";
    case "form":
      return "form";
    case "table":
      return "table";
    case "textarea":
      return "textbox";
    case "select":
      return "combobox";
    case "img":
      return "img";
    case "dialog":
      return "dialog";
    case "input": {
      const type = element.getAttribute("type")?.toLowerCase() ?? "text";
      if (type === "checkbox") {
        return "checkbox";
      }
      if (type === "radio") {
        return "radio";
      }
      if (type === "button" || type === "submit" || type === "reset") {
        return "button";
      }
      if (type === "search") {
        return "searchbox";
      }
      return "textbox";
    }
    default:
      return null;
  }
}

function getElementRole(element: Element): string | null {
  const explicitRole = normalizeText(element.getAttribute("role"));
  if (explicitRole) {
    return explicitRole.split(/\s+/)[0] ?? null;
  }

  return inferImplicitRole(element);
}

function getElementName(element: Element): string {
  try {
    return normalizeText(computeAccessibleName(element));
  } catch {
    return "";
  }
}

function summarizeRoles(elements: Element[]): {
  roles: RoleSummary[];
  landmarks: RoleSummary[];
} {
  const roleCounts = new Map<string, number>();
  const landmarkCounts = new Map<string, number>();

  for (const element of elements) {
    const role = getElementRole(element);
    if (!role) {
      continue;
    }

    const name = getElementName(element);
    const key = `${role}\u0000${name}`;
    roleCounts.set(key, (roleCounts.get(key) ?? 0) + 1);

    if (LANDMARK_ROLES.has(role)) {
      landmarkCounts.set(key, (landmarkCounts.get(key) ?? 0) + 1);
    }
  }

  const toSummaries = (source: Map<string, number>): RoleSummary[] =>
    [...source.entries()]
      .map(([key, count]) => {
        const separatorIndex = key.indexOf("\u0000");
        const role = key.slice(0, separatorIndex);
        const name = key.slice(separatorIndex + 1);
        return {
          role,
          name,
          count,
        };
      })
      .sort((left, right) =>
        `${left.role}:${left.name}`.localeCompare(
          `${right.role}:${right.name}`,
        ),
      );

  return {
    roles: toSummaries(roleCounts),
    landmarks: toSummaries(landmarkCounts),
  };
}

function formatStructureToken(element: Element): string {
  return getElementRole(element) ?? element.tagName.toLowerCase();
}

function summarizeStructure(document: Document): string[] {
  const interestingSelectors = [
    "main",
    "nav",
    "header",
    "footer",
    "form",
    "table",
    "dialog",
    "[role]",
    "button",
    "input",
    "select",
    "textarea",
  ];
  const interestingElements = Array.from(
    document.querySelectorAll(interestingSelectors.join(",")),
  );
  const summaries = new Set<string>();

  for (const element of interestingElements) {
    const pathTokens: string[] = [];
    let current: Element | null = element;

    while (current && pathTokens.length < 4) {
      const token = formatStructureToken(current);
      if (pathTokens[0] !== token) {
        pathTokens.unshift(token);
      }
      current = current.parentElement;
    }

    summaries.add(pathTokens.join(" > "));
    if (summaries.size >= 12) {
      break;
    }
  }

  return [...summaries];
}

interface SummarizedDocument {
  title: string;
  roles: RoleSummary[];
  landmarks: RoleSummary[];
  structure: string[];
}

export function summarizeHtmlDocument(html: string): SummarizedDocument {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const allElements = Array.from(document.querySelectorAll("*")) as Element[];
  const { roles, landmarks } = summarizeRoles(allElements);

  return {
    title: document.title ?? "",
    roles,
    landmarks,
    structure: summarizeStructure(document),
  };
}

export function dedupeRuntimeErrors(
  errors: RuntimeErrorRecord[],
): RuntimeErrorRecord[] {
  const seen = new Set<string>();
  const deduped: RuntimeErrorRecord[] = [];

  for (const error of errors) {
    const key = `${error.kind}\u0000${error.level ?? ""}\u0000${error.message}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(error);
  }

  return deduped;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown runtime inspection error";
}

/**
 * Options for {@link assertFetchableUrl} and {@link safeFetchWithTimeout}.
 */
export interface FetchableUrlOptions {
  /**
   * When `true`, block http(s) URLs targeting loopback or RFC 1918 / RFC 4193
   * private ranges. Defaults to `false` because `runtime-inspector-core` is a
   * dev-tool library where inspecting `http://localhost:3000` is the common
   * case. Hosts embedding this library behind an untrusted boundary (e.g. a
   * service that accepts URLs from anonymous users) should pass `true` to
   * harden against SSRF.
   */
  blockLoopback?: boolean;
}

/**
 * Validates a URL is safe for outbound fetching against an SSRF threat model.
 *
 * Always blocked (no legitimate dev-tool use case):
 * - Non-http(s) schemes (`file:`, `gopher:`, `ftp:`, ...) — protocol confusion
 *   and arbitrary local-file reads.
 * - Cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`,
 *   `metadata.goog`) — credential exfiltration via IMDS.
 *
 * Optionally blocked when `blockLoopback: true`:
 * - Loopback (`localhost`, `127.0.0.0/8`, `::1`).
 * - RFC 1918 / RFC 4193 / IPv6 link-local ranges.
 *
 * Throws a descriptive `Error` when the URL is unsafe so callers can surface
 * the failure to the agent/user instead of silently issuing the request.
 */
export function assertFetchableUrl(
  rawUrl: string,
  options: FetchableUrlOptions = {},
): URL {
  const parsed = new URL(rawUrl);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Only http: and https: URLs are allowed; received ${parsed.protocol}`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();

  // Always block cloud instance metadata endpoints — no dev-tool needs these
  // and they are a common SSRF exfiltration target.
  if (
    /^169\.254\./.test(hostname) ||
    hostname === "metadata.google.internal" ||
    hostname === "metadata.goog"
  ) {
    throw new Error(
      `URL hostname '${hostname}' targets a cloud metadata endpoint and is blocked`,
    );
  }

  if (options.blockLoopback) {
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      /^127\./.test(hostname) ||
      /^0\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      hostname === "[::1]" ||
      hostname === "::1" ||
      hostname === "[::]" ||
      hostname === "::" ||
      /^\[?fe80:/i.test(hostname) ||
      /^\[?fc00:/i.test(hostname) ||
      /^\[?fd[0-9a-f]{2}:/i.test(hostname)
    ) {
      throw new Error(
        `URL hostname '${hostname}' resolves to a loopback or private IP range`,
      );
    }
  }

  return parsed;
}

/**
 * Fetches a URL with a timeout and SSRF guard. Use this instead of `fetch()`
 * whenever the URL is influenced by user/agent input.
 *
 * `redirect: "manual"` prevents the upstream service from re-targeting the
 * request at a blocked host after the initial validation succeeds.
 */
export async function safeFetchWithTimeout(
  url: string,
  timeoutMs: number,
  options: FetchableUrlOptions = {},
): Promise<Response> {
  assertFetchableUrl(url, options);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function sanitizeArtifactStem(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/[^a-z0-9]+/gi, "-");
    const pathPart = `${parsed.pathname}${parsed.search ? "-query" : ""}`
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    const stem = [host, pathPart].filter(Boolean).join("-");

    return (stem || "runtime-inspect").slice(0, 64);
  } catch {
    return "runtime-inspect";
  }
}

export async function ensureArtifactDir(
  preferredOutputDir?: string,
): Promise<string> {
  if (preferredOutputDir) {
    await fs.mkdir(preferredOutputDir, { recursive: true });
    return preferredOutputDir;
  }

  return fs.mkdtemp(path.join(os.tmpdir(), "salt-runtime-inspect-"));
}

export function createBaseResult(
  options: RuntimeInspectOptions,
  partial: Omit<RuntimeInspectResult, "toolVersion" | "timestamp">,
): RuntimeInspectResult {
  return {
    toolVersion: options.toolVersion ?? "0.0.0",
    timestamp: options.timestamp ?? new Date().toISOString(),
    ...partial,
  };
}

export function createUnavailableLayoutEvidence(
  hints: string[] = [],
): RuntimeInspectResult["layout"] {
  const normalizedHints = [...new Set([FETCHED_HTML_LAYOUT_HINT, ...hints])]
    .map((hint) => normalizeText(hint))
    .filter(Boolean);

  return {
    available: false,
    mode: "unavailable",
    hints: normalizedHints,
    nodes: [],
  };
}

