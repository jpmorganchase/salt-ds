import path from "node:path";
import { inspectUrl } from "@salt-ds/runtime-inspector-core";
import { writeJsonFile } from "../lib/common.js";
import type { RequiredCliIo } from "../types.js";

type RuntimeInspectResult = Awaited<ReturnType<typeof inspectUrl>>;

function toAgentRuntimeInspectJson(
  result: RuntimeInspectResult,
): Record<string, unknown> {
  return {
    target: {
      url: result.target.url,
    },
    inspectionMode: result.inspectionMode,
    page: {
      title: result.page.title,
      statusCode: result.page.statusCode,
      loadState: result.page.loadState,
      contentType: result.page.contentType,
    },
    errors: result.errors.slice(0, 5).map((error) => ({
      kind: error.kind,
      level: error.level ?? null,
      message: error.message,
    })),
    accessibility: {
      roles: result.accessibility.roles.slice(0, 5).map((entry) => ({
        role: entry.role,
        name: entry.name ?? null,
        count: entry.count ?? null,
      })),
      landmarks: result.accessibility.landmarks.slice(0, 5).map((entry) => ({
        role: entry.role,
        name: entry.name ?? null,
      })),
    },
    layout: {
      available: result.layout.available,
      nodeCount: result.layout.nodes.length,
      hints: result.layout.hints.slice(0, 4),
      nodes: result.layout.nodes.slice(0, 3).map((node) => ({
        label: node.label,
        selector: node.selector,
        box: node.box,
        display: node.computedStyle.display,
        justifyContent: node.computedStyle.justifyContent,
        alignItems: node.computedStyle.alignItems,
      })),
    },
    notes: result.notes.slice(0, 5),
    artifacts: result.artifacts.slice(0, 5).map((artifact) => ({
      kind: artifact.kind,
      path: artifact.path,
      label: artifact.label ?? null,
    })),
  };
}

function formatLayoutNode(
  node: Awaited<ReturnType<typeof inspectUrl>>["layout"]["nodes"][number],
): string {
  const box = `${node.box.width}x${node.box.height}@${node.box.x},${node.box.y}`;
  const core = `${node.label} [${node.selector}] box=${box} display=${node.computedStyle.display} justify=${node.computedStyle.justifyContent} align=${node.computedStyle.alignItems} text=${node.computedStyle.textAlign}`;
  if (node.ancestorChain.length === 0) {
    return core;
  }

  const ancestorSummary = node.ancestorChain
    .slice(0, 2)
    .map(
      (ancestor) =>
        `${ancestor.label} (${ancestor.computedStyle.display}, justify=${ancestor.computedStyle.justifyContent}, align=${ancestor.computedStyle.alignItems})`,
    )
    .join(" <- ");

  return `${core} via ${ancestorSummary}`;
}

function formatRuntimeInspectReport(
  result: Awaited<ReturnType<typeof inspectUrl>>,
): string {
  const lines = [
    "Salt Runtime Inspect",
    `URL: ${result.target.url}`,
    `Mode: ${result.inspectionMode}`,
    `Page: ${result.page.title || "(untitled)"} (${result.page.statusCode}, ${result.page.loadState})`,
    `Content-Type: ${result.page.contentType || "unknown"}`,
    `Errors: ${result.errors.length}`,
    `Roles: ${
      result.accessibility.roles.length > 0
        ? result.accessibility.roles
            .slice(0, 8)
            .map(
              (entry) =>
                `${entry.role}${entry.name ? `("${entry.name}")` : ""}${entry.count ? ` x${entry.count}` : ""}`,
            )
            .join(", ")
        : "none"
    }`,
    `Landmarks: ${
      result.accessibility.landmarks.length > 0
        ? result.accessibility.landmarks
            .map(
              (entry) =>
                `${entry.role}${entry.name ? `("${entry.name}")` : ""}`,
            )
            .join(", ")
        : "none"
    }`,
    `Layout: ${
      result.layout.available
        ? `${result.layout.nodes.length} computed node(s)`
        : "unavailable"
    }`,
  ];

  if (result.notes.length > 0) {
    lines.push("Notes:");
    lines.push(...result.notes.map((note) => `- ${note}`));
  }

  if (result.structure.summary.length > 0) {
    lines.push("Structure:");
    lines.push(...result.structure.summary.map((entry) => `- ${entry}`));
  }

  if (result.layout.hints.length > 0) {
    lines.push("Layout hints:");
    lines.push(...result.layout.hints.map((hint) => `- ${hint}`));
  }

  if (result.layout.nodes.length > 0) {
    lines.push("Layout nodes:");
    lines.push(
      ...result.layout.nodes
        .slice(0, 4)
        .map((node) => `- ${formatLayoutNode(node)}`),
    );
  }

  if (result.errors.length > 0) {
    lines.push("Reported issues:");
    lines.push(
      ...result.errors.map(
        (error) =>
          `- ${error.kind}${error.level ? `/${error.level}` : ""}: ${error.message}`,
      ),
    );
  }

  if (result.artifacts.length > 0) {
    lines.push("Artifacts:");
    lines.push(
      ...result.artifacts.map(
        (artifact) =>
          `- ${artifact.kind}: ${artifact.path}${artifact.label ? ` (${artifact.label})` : ""}`,
      ),
    );
  }

  return `${lines.join("\n")}\n`;
}

export async function runRuntimeInspectCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const rawUrl = positionals[1];
  if (!rawUrl) {
    io.writeStderr("Missing URL. Usage: salt-ds runtime inspect <url>\n");
    return 1;
  }

  const timeoutMs = flags.timeout ? Number(flags.timeout) : undefined;
  const result = await inspectUrl(rawUrl, {
    mode:
      flags.mode === "browser" || flags.mode === "fetched-html"
        ? flags.mode
        : "auto",
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
    outputDir: flags["output-dir"]
      ? path.resolve(io.cwd, flags["output-dir"])
      : undefined,
    captureScreenshot: flags["no-screenshot"] !== "true",
  });
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;
  const wantsAgentJson = flags["agent-json"] === "true";
  const wantsJson = flags.json === "true" || wantsAgentJson;
  const resultWithArtifacts = outputPath
    ? {
        ...result,
        artifacts: [
          ...result.artifacts,
          {
            kind: "json",
            path: outputPath,
            label: "runtime-report",
          },
        ],
      }
    : result;
  const jsonResult = wantsAgentJson
    ? toAgentRuntimeInspectJson(resultWithArtifacts)
    : resultWithArtifacts;

  if (outputPath) {
    await writeJsonFile(outputPath, jsonResult);

    if (wantsJson) {
      io.writeStdout(`${JSON.stringify(jsonResult, null, 2)}\n`);
    } else {
      io.writeStdout(formatRuntimeInspectReport(resultWithArtifacts));
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }

    return resultWithArtifacts.errors.length > 0 ? 2 : 0;
  }

  if (wantsJson) {
    io.writeStdout(`${JSON.stringify(jsonResult, null, 2)}\n`);
  } else {
    io.writeStdout(formatRuntimeInspectReport(result));
  }

  return result.errors.length > 0 ? 2 : 0;
}
