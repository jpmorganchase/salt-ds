import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { computeAccessibleName } from "dom-accessibility-api";
import { JSDOM } from "jsdom";
import type {
  ArtifactDescriptor,
  RoleSummary,
  RuntimeErrorRecord,
  RuntimeInspectResult,
} from "./schemas.js";

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

const LANDMARK_ROLES = new Set([
  "banner",
  "complementary",
  "contentinfo",
  "form",
  "main",
  "navigation",
  "region",
  "search",
]);

const DEFAULT_VIEWPORT = {
  width: 1440,
  height: 900,
} as const;

interface SummarizedDocument {
  title: string;
  roles: RoleSummary[];
  landmarks: RoleSummary[];
  structure: string[];
}

interface BrowserLayoutPage {
  evaluate<T>(pageFunction: () => T): Promise<T>;
}

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

function summarizeHtmlDocument(html: string): SummarizedDocument {
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

function dedupeRuntimeErrors(
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown runtime inspection error";
}

function sanitizeArtifactStem(url: string): string {
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

async function ensureArtifactDir(preferredOutputDir?: string): Promise<string> {
  if (preferredOutputDir) {
    await fs.mkdir(preferredOutputDir, { recursive: true });
    return preferredOutputDir;
  }

  return fs.mkdtemp(path.join(os.tmpdir(), "salt-runtime-inspect-"));
}

function createBaseResult(
  options: RuntimeInspectOptions,
  partial: Omit<RuntimeInspectResult, "toolVersion" | "timestamp">,
): RuntimeInspectResult {
  return {
    toolVersion: options.toolVersion ?? "0.0.0",
    timestamp: options.timestamp ?? new Date().toISOString(),
    ...partial,
  };
}

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

function createUnavailableLayoutEvidence(
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

async function captureBrowserLayoutEvidence(
  page: BrowserLayoutPage,
): Promise<RuntimeInspectResult["layout"]> {
  return page.evaluate(() => {
    const MAX_LAYOUT_NODES = 6;
    const MAX_ANCESTORS = 4;
    const layoutDisplays = new Set([
      "flex",
      "inline-flex",
      "grid",
      "inline-grid",
    ]);
    const candidateSelectors = [
      '[role="navigation"]',
      "nav",
      '[role="main"]',
      "main",
      "header",
      "footer",
      '[role="dialog"]',
      "dialog",
      "form",
      "table",
      '[role="button"]',
      "button",
      "input",
      "select",
      "textarea",
    ];

    const normalize = (value: string | null | undefined): string =>
      value?.replace(/\s+/g, " ").trim() ?? "";

    const inferImplicitRole = (element: Element): string => {
      const tagName = element.tagName.toLowerCase();
      switch (tagName) {
        case "a":
          return element.hasAttribute("href") ? "link" : "";
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
          return "";
      }
    };

    const getRole = (element: Element): string => {
      const explicitRole = normalize(element.getAttribute("role"));
      if (explicitRole) {
        return explicitRole.split(/\s+/)[0] ?? "";
      }

      return inferImplicitRole(element);
    };

    const getName = (element: Element): string => {
      const ariaLabel = normalize(element.getAttribute("aria-label"));
      if (ariaLabel) {
        return ariaLabel;
      }

      const labelledBy = normalize(element.getAttribute("aria-labelledby"));
      if (labelledBy) {
        const labelText = labelledBy
          .split(/\s+/)
          .map((id) => normalize(document.getElementById(id)?.textContent))
          .filter(Boolean)
          .join(" ");
        if (labelText) {
          return labelText;
        }
      }

      return normalize(
        (element as HTMLElement).innerText || element.textContent || "",
      ).slice(0, 80);
    };

    const getSelector = (element: Element): string => {
      const tagName = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : "";
      const classNames = Array.from(element.classList)
        .slice(0, 2)
        .map((className) => `.${className}`)
        .join("");
      return `${tagName}${id}${classNames}` || tagName;
    };

    const round = (value: number): number => Math.round(value * 100) / 100;

    const getBox = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: round(rect.x),
        y: round(rect.y),
        width: round(rect.width),
        height: round(rect.height),
      };
    };

    const getComputedStyleSummary = (element: Element) => {
      const style = window.getComputedStyle(element);
      return {
        display: style.display || "unknown",
        position: style.position || "static",
        justifyContent: style.justifyContent || "normal",
        alignItems: style.alignItems || "normal",
        textAlign: style.textAlign || "start",
        overflowX: style.overflowX || "visible",
        overflowY: style.overflowY || "visible",
      };
    };

    const getLabel = (element: Element): string => {
      const role = getRole(element);
      const name = getName(element);
      if (role && name) {
        return `${role}("${name}")`;
      }
      return role || getSelector(element);
    };

    const getAncestorChain = (element: Element) => {
      const ancestors = [];
      let current = element.parentElement;

      while (current && ancestors.length < MAX_ANCESTORS) {
        ancestors.push({
          selector: getSelector(current),
          label: getLabel(current),
          box: getBox(current),
          computedStyle: getComputedStyleSummary(current),
        });
        current = current.parentElement;
      }

      return ancestors;
    };

    const collectNodeHints = (node: {
      label: string;
      box: { width: number; height: number };
      computedStyle: {
        display: string;
        justifyContent: string;
        alignItems: string;
        textAlign: string;
        overflowX: string;
        overflowY: string;
      };
      ancestorChain: Array<{
        label: string;
        computedStyle: {
          display: string;
          justifyContent: string;
          alignItems: string;
          overflowX: string;
          overflowY: string;
        };
      }>;
    }): string[] => {
      const hints: string[] = [];

      if (
        layoutDisplays.has(node.computedStyle.display) &&
        (node.computedStyle.justifyContent.includes("center") ||
          node.computedStyle.alignItems.includes("center"))
      ) {
        hints.push(
          `${node.label} uses ${node.computedStyle.display} centering.`,
        );
      }

      if (node.computedStyle.textAlign === "center") {
        hints.push(`${node.label} applies text-align:center.`);
      }

      if (
        ["hidden", "clip"].includes(node.computedStyle.overflowX) ||
        ["hidden", "clip"].includes(node.computedStyle.overflowY)
      ) {
        hints.push(`${node.label} clips overflow.`);
      }

      if (node.box.width === 0 || node.box.height === 0) {
        hints.push(`${node.label} has a zero-sized box.`);
      }

      const centeredAncestor = node.ancestorChain.find(
        (ancestor) =>
          layoutDisplays.has(ancestor.computedStyle.display) &&
          (ancestor.computedStyle.justifyContent.includes("center") ||
            ancestor.computedStyle.alignItems.includes("center")),
      );

      if (centeredAncestor) {
        hints.push(
          `${node.label} sits inside centered ancestor ${centeredAncestor.label}.`,
        );
      }

      const clippingAncestor = node.ancestorChain.find(
        (ancestor) =>
          ["hidden", "clip"].includes(ancestor.computedStyle.overflowX) ||
          ["hidden", "clip"].includes(ancestor.computedStyle.overflowY),
      );

      if (clippingAncestor) {
        hints.push(
          `${node.label} sits inside overflow-clipping ancestor ${clippingAncestor.label}.`,
        );
      }

      return hints;
    };

    const candidates: Element[] = [];
    const seen = new Set<Element>();

    for (const selector of candidateSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      for (const element of elements) {
        if (seen.has(element)) {
          continue;
        }

        seen.add(element);
        candidates.push(element);

        if (candidates.length >= MAX_LAYOUT_NODES) {
          break;
        }
      }

      if (candidates.length >= MAX_LAYOUT_NODES) {
        break;
      }
    }

    const nodes = candidates.map((element) => {
      const node = {
        selector: getSelector(element),
        label: getLabel(element),
        role: getRole(element),
        name: getName(element),
        box: getBox(element),
        computedStyle: getComputedStyleSummary(element),
        ancestorChain: getAncestorChain(element),
        hints: [] as string[],
      };
      node.hints = collectNodeHints(node);
      return node;
    });

    const hintSet = new Set<string>();
    if (nodes.length > 0) {
      hintSet.add(
        `Captured computed layout evidence for ${nodes.length} node(s).`,
      );
    } else {
      hintSet.add(
        "No structural layout nodes were captured from the rendered page.",
      );
    }

    for (const node of nodes) {
      for (const hint of node.hints) {
        hintSet.add(hint);
      }
    }

    return {
      available: true,
      mode: "computed-style" as const,
      hints: [...hintSet].slice(0, 8),
      nodes,
    };
  });
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

async function inspectBrowserSession(
  url: string,
  options: RuntimeInspectOptions,
): Promise<RuntimeInspectResult> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: options.viewport ?? DEFAULT_VIEWPORT,
    });
    const page = await context.newPage();
    const errors: RuntimeErrorRecord[] = [];

    page.on("pageerror", (error) => {
      errors.push({
        kind: "pageerror",
        level: "error",
        message: error.message,
      });
    });

    page.on("console", (message) => {
      if (message.type() !== "error") {
        return;
      }

      errors.push({
        kind: "console",
        level: message.type(),
        message: message.text(),
      });
    });

    let response: Awaited<ReturnType<typeof page.goto>> | null = null;

    try {
      response = await page.goto(url, {
        waitUntil: "load",
        timeout: options.timeoutMs ?? 10_000,
      });
    } catch (error) {
      errors.push({
        kind: "navigation",
        level: "error",
        message: getErrorMessage(error),
      });
    }

    try {
      await page.waitForLoadState("networkidle", {
        timeout: Math.min(1_500, options.timeoutMs ?? 10_000),
      });
    } catch {
      // Some pages intentionally keep background requests alive.
    }

    const html = await page.content();
    const summarized = summarizeHtmlDocument(html);
    const layout = await captureBrowserLayoutEvidence(page);
    const finalUrl = page.url();
    const contentType = response?.headers()["content-type"] ?? "";
    const screenshots: RuntimeInspectResult["screenshots"] = [];
    const artifacts: ArtifactDescriptor[] = [];

    if (response && !response.ok()) {
      errors.push({
        kind: "http",
        level: "error",
        message: `HTTP ${response.status()} returned from ${finalUrl || url}`,
      });
    }

    if (contentType && !contentType.toLowerCase().includes("html")) {
      errors.push({
        kind: "content-type",
        level: "warn",
        message: `Expected HTML content but received '${contentType}'`,
      });
    }

    if (options.captureScreenshot !== false) {
      const artifactDir = await ensureArtifactDir(options.outputDir);
      const screenshotPath = path.join(
        artifactDir,
        `${sanitizeArtifactStem(finalUrl || url)}.png`,
      );
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      screenshots.push({
        path: screenshotPath,
        label: "full-page",
      });
      artifacts.push({
        kind: "screenshot",
        path: screenshotPath,
        label: "full-page",
      });
    }

    return createBaseResult(options, {
      inspectionMode: "browser-session",
      notes: [],
      target: {
        url: finalUrl || url,
      },
      page: {
        title: (await page.title()) || summarized.title,
        loadState: "load",
        statusCode: response?.status() ?? 0,
        contentType,
      },
      errors: dedupeRuntimeErrors(errors),
      accessibility: {
        roles: summarized.roles,
        landmarks: summarized.landmarks,
      },
      structure: {
        summary: summarized.structure,
      },
      layout,
      screenshots,
      artifacts,
    });
  } finally {
    await browser.close();
  }
}

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
