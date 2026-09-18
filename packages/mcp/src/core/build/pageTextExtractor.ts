import { toString as mdastToString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
}

function resolveRemarkPlugin<T>(plugin: T): T {
  if (
    plugin &&
    typeof plugin === "object" &&
    "default" in (plugin as Record<string, unknown>)
  ) {
    return ((plugin as unknown as { default: T }).default ?? plugin) as T;
  }

  return plugin;
}

function normalizeExtractedText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function pushTextBlock(blocks: string[], value: string): void {
  const normalizedValue = normalizeExtractedText(value);
  if (
    normalizedValue.length > 0 &&
    !normalizedValue.toLowerCase().startsWith(":fragment")
  ) {
    blocks.push(normalizedValue);
  }
}

function collectTextBlocks(node: MarkdownNode, blocks: string[]): void {
  switch (node.type) {
    case "paragraph":
    case "listItem":
      pushTextBlock(blocks, mdastToString(node));
      return;
    case "tableRow": {
      const rowValue = (node.children ?? [])
        .map((cell) => normalizeExtractedText(mdastToString(cell)))
        .filter((cell) => cell.length > 0)
        .join(" | ");

      pushTextBlock(blocks, rowValue);
      return;
    }
    default:
      for (const child of node.children ?? []) {
        collectTextBlocks(child, blocks);
      }
  }
}

export function extractMdxTextBlocks(source: string): string[] {
  const tree = unified()
    .use(resolveRemarkPlugin(remarkParse) as never)
    .use(resolveRemarkPlugin(remarkGfm) as never)
    .use(resolveRemarkPlugin(remarkMdx) as never)
    .parse(source) as MarkdownNode;

  const blocks: string[] = [];
  collectTextBlocks(tree, blocks);
  return blocks;
}
