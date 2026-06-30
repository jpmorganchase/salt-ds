import path from "node:path";
import {
  type BrowserLayoutPage,
  createBaseResult,
  DEFAULT_VIEWPORT,
  dedupeRuntimeErrors,
  ensureArtifactDir,
  getErrorMessage,
  type RuntimeInspectOptions,
  sanitizeArtifactStem,
  summarizeHtmlDocument,
} from "./inspectShared.js";
import type {
  ArtifactDescriptor,
  RuntimeErrorRecord,
  RuntimeInspectResult,
} from "./schemas.js";

const PLAYWRIGHT_INSTALL_HINT =
  "Browser-session inspection requires the optional `playwright` peer dependency. Install it with `npm install playwright` (or `yarn add playwright`) and rerun, or use `--mode fetched-html`.";

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

async function loadPlaywrightChromium(): Promise<
  typeof import("playwright").chromium
> {
  try {
    const playwright = await import("playwright");
    return playwright.chromium;
  } catch (error) {
    throw new Error(
      `${PLAYWRIGHT_INSTALL_HINT} (detail: ${getErrorMessage(error)})`,
    );
  }
}

/**
 * Open a real Chromium session via Playwright, navigate to `url`, and
 * capture rich runtime evidence: hydrated title, runtime/console errors,
 * accessibility tree, structural summary, computed-layout evidence with
 * flex/grid ancestry, and optionally a full-page screenshot.
 *
 * Requires the optional `playwright` peer dependency. If `playwright` is
 * not installed in the consuming project this function throws an error
 * whose message is the documented install hint, surfacing the same
 * guidance the core lazy-loader uses for `--mode browser`.
 */
export async function inspectBrowserSession(
  url: string,
  options: RuntimeInspectOptions = {},
): Promise<RuntimeInspectResult> {
  const chromium = await loadPlaywrightChromium();
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
