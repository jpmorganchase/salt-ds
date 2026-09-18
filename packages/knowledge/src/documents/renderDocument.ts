import {
  escapeUntrustedMarkdownText,
  renderUntrustedMarkdownCode,
  renderUntrustedMarkdownEvidence,
  resolveUntrustedMarkdownLink,
} from "../markdown/untrustedMarkdown.js";
import type {
  DocumentBlock,
  DocumentInline,
  DocumentModel,
  DocumentSection,
} from "./documentSchema.js";

export interface RenderDocumentOptions {
  route: string;
  fileReference?: (sourcePath: string) => string | null;
}

function unsupportedDocumentNode(_node: never): never {
  throw new Error("Unsupported canonical document node.");
}

export function documentInlineText(nodes: readonly DocumentInline[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "text" || node.kind === "inline_code")
        return node.value;
      if (node.kind === "break") return "\n";
      return documentInlineText(node.children);
    })
    .join("");
}

export function renderDocumentInline(
  nodes: readonly DocumentInline[],
  options: RenderDocumentOptions,
): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case "text":
          return escapeUntrustedMarkdownText(
            node.value.replace(/\s*\n\s*/gu, " "),
          );
        case "inline_code":
          return renderUntrustedMarkdownEvidence(node.value, {
            mode: "inline",
          });
        case "break":
          return "  \n";
        case "emphasis":
          return `*${renderDocumentInline(node.children, options)}*`;
        case "strong":
          return `**${renderDocumentInline(node.children, options)}**`;
        case "delete":
          return `~~${renderDocumentInline(node.children, options)}~~`;
        case "link": {
          const label = renderDocumentInline(node.children, options);
          const href = resolveUntrustedMarkdownLink(node.href, options.route);
          return href ? `[${label}](${href})` : `${label} (unavailable link)`;
        }
      }
      return unsupportedDocumentNode(node);
    })
    .join("");
}

export function renderDocumentBlocks(
  blocks: readonly DocumentBlock[],
  options: RenderDocumentOptions,
): string {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case "paragraph":
          return renderDocumentInline(block.children, options);
        case "heading":
          return `${"#".repeat(block.level)} ${renderDocumentInline(block.children, options)}`;
        case "code":
          return renderUntrustedMarkdownCode(block.value, block.language ?? "");
        case "list":
          return block.items
            .map((item, index) => {
              const marker = block.ordered
                ? `${(block.start ?? 1) + index}. `
                : "- ";
              const lines = renderDocumentBlocks(item, options).split("\n");
              return (
                marker +
                lines
                  .map((line, lineIndex) =>
                    lineIndex === 0 ? line : " ".repeat(marker.length) + line,
                  )
                  .join("\n")
              );
            })
            .join(block.spread ? "\n\n" : "\n");
        case "guidance_callout": {
          const label =
            block.label ?? (block.tone === "negative" ? "Avoid" : "Guidance");
          const body = `**${escapeUntrustedMarkdownText(label)}**\n\n${renderDocumentBlocks(block.blocks, options)}`;
          return body
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        }
        case "diagram": {
          const label = block.alt || block.caption || "Form layout diagram";
          const href = resolveUntrustedMarkdownLink(
            block.asset.public_path,
            options.route,
          );
          const description = href
            ? `[${escapeUntrustedMarkdownText(label)}](${href})`
            : escapeUntrustedMarkdownText(label);
          const caption =
            block.caption && block.caption !== label
              ? `\n\n${escapeUntrustedMarkdownText(block.caption)}`
              : "";
          const body = block.blocks.length
            ? `\n\n${renderDocumentBlocks(block.blocks, options)}`
            : "";
          return `Diagram: ${description}${caption}${body}`;
        }
        case "diagram_group":
          return (
            (block.label
              ? `**${escapeUntrustedMarkdownText(block.label)}**\n\n`
              : "") + renderDocumentBlocks(block.items, options)
          );
        case "live_preview": {
          const title = block.display_name ?? block.example_name;
          const reference = block.example_source_path
            ? options.fileReference?.(block.example_source_path)
            : null;
          return `Example: ${escapeUntrustedMarkdownText(title)}${reference ? `\n\nComplete example file: ${renderUntrustedMarkdownEvidence(reference, { mode: "inline" })}` : "\n\nThe example file is unavailable in this document."}`;
        }
        case "unsupported":
          return `Content unavailable: ${escapeUntrustedMarkdownText(block.diagnostic_id)}.`;
      }
      return unsupportedDocumentNode(block);
    })
    .filter(Boolean)
    .join("\n\n");
}

export function renderDocumentSection(
  section: DocumentSection,
  options: RenderDocumentOptions,
): string {
  const heading = section.heading
    ? `${"#".repeat(section.level ?? 2)} ${renderDocumentInline(section.heading, options)}\n\n`
    : "";
  return heading + renderDocumentBlocks(section.blocks, options);
}

export function documentSectionText(section: DocumentSection): string {
  const blocksText = (blocks: readonly DocumentBlock[]): string =>
    blocks
      .map((block) => {
        switch (block.kind) {
          case "paragraph":
          case "heading":
            return documentInlineText(block.children);
          case "code":
            return block.value;
          case "list":
            return block.items.map(blocksText).join(" ");
          case "guidance_callout":
            return `${block.label ?? ""} ${blocksText(block.blocks)}`;
          case "diagram":
            return `${block.alt} ${block.caption ?? ""} ${blocksText(block.blocks)}`;
          case "diagram_group":
            return `${block.label ?? ""} ${blocksText(block.items)}`;
          case "live_preview":
            return `${block.display_name ?? block.example_name} ${block.example_source_path ?? ""}`;
          case "unsupported":
            return "";
        }
        return unsupportedDocumentNode(block);
      })
      .join(" ");
  return `${section.heading_path.join(" ")} ${blocksText(section.blocks)}`.trim();
}

export function documentText(document: DocumentModel): string {
  return document.sections.map(documentSectionText).join("\n\n");
}
