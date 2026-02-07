import fs from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";

const docsDir = path.resolve(process.cwd(), "docs");
const examplesDir = path.resolve(process.cwd(), "src", "examples");

function readExampleSource(
  componentName: string,
  exampleName: string,
): string | null {
  const examplePath = path.resolve(
    examplesDir,
    componentName,
    `${exampleName}.tsx`,
  );
  if (
    !examplePath.startsWith(examplesDir + path.sep) ||
    !fs.existsSync(examplePath)
  ) {
    return null;
  }
  return fs.readFileSync(examplePath, "utf-8");
}

function cleanMdxContent(raw: string): string {
  let content = raw;

  // Strip YAML frontmatter
  content = content.replace(/^---[\s\S]*?---\n*/, "");

  // Preserve fenced code blocks by replacing them with placeholders
  const codeBlocks: string[] = [];
  content = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Strip import statements (only outside code blocks now)
  content = content.replace(/^import\s+.*$/gm, "");

  // Convert <LivePreview> to inline code examples (stored as placeholders)
  content = content.replace(
    /<LivePreview\s+componentName="([^"]*)"\s+exampleName="([^"]*)"\s*\/>/g,
    (_match, componentName, exampleName) => {
      const source = readExampleSource(componentName, exampleName);
      if (source) {
        const block = `\`\`\`tsx\n${source.trim()}\n\`\`\``;
        codeBlocks.push(block);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
      }
      return "";
    },
  );

  // Convert <Callout title="X" status="...">text</Callout> to blockquote
  content = content.replace(
    /<Callout[^>]*?\btitle="([^"]*)"[^>]*>([\s\S]*?)<\/Callout>/g,
    (_match, title, body) => {
      const trimmedBody = body.trim();
      return trimmedBody
        ? `> **${title}**\n>\n> ${trimmedBody}`
        : `> **${title}**`;
    },
  );

  // Convert <Diagram ... /> to markdown image (multiline tags)
  content = content.replace(/<Diagram\s[\s\S]*?\/>/g, (match) => {
    const srcMatch = match.match(/\bsrc="([^"]*)"/);
    const altMatch = match.match(/\balt="([^"]*)"/);
    const src = srcMatch?.[1] ?? "";
    const alt = altMatch?.[1] ?? "";
    return `![${alt}](${src})`;
  });

  // Strip wrapper-only tags (Diagrams, LivePreview, br, etc.)
  content = content.replace(/<Diagrams[^>]*>/g, "");
  content = content.replace(/<\/Diagrams>/g, "");
  content = content.replace(/<LivePreview[^>]*\/>/g, "");
  content = content.replace(/<LivePreview[^>]*>[\s\S]*?<\/LivePreview>/g, "");
  content = content.replace(/<br\s*\/?>/g, "");
  content = content.replace(/<br><\/br>/g, "");

  // Strip PropsTable component tags
  content = content.replace(/<PropsTable[^>]*\/>/g, "");

  // Strip JSX comments {/* ... */}
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // Strip remaining self-closing JSX tags (e.g., <Component ... />)
  content = content.replace(/<[A-Z]\w*\s[\s\S]*?\/>/g, "");

  // Strip remaining JSX opening/closing tags but preserve inner text
  content = content.replace(/<[A-Z]\w*(?:\s[\s\S]*?)?>/g, "");
  content = content.replace(/<\/[A-Z]\w*>/g, "");

  // Strip Mosaic directives (e.g., :fragment{src="..."})
  content = content.replace(/^:fragment\{[^}]*\}$/gm, "");

  // Restore fenced code blocks
  content = content.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
    return codeBlocks[Number(index)];
  });

  // Collapse multiple blank lines into at most two
  content = content.replace(/\n{3,}/g, "\n\n");

  return content.trim();
}

// Preferred order and display names for component tab files
const TAB_ORDER: { file: string; heading: string }[] = [
  { file: "examples", heading: "Examples" },
  { file: "usage", heading: "How to use" },
  { file: "accessibility", heading: "Accessibility" },
];

function readComponentDirectory(dirPath: string): string {
  const sections: string[] = [];

  for (const tab of TAB_ORDER) {
    const tabFile = path.join(dirPath, `${tab.file}.mdx`);
    if (fs.existsSync(tabFile)) {
      const raw = fs.readFileSync(tabFile, "utf-8");
      const cleaned = cleanMdxContent(raw);
      if (cleaned) {
        sections.push(`## ${tab.heading}\n\n${cleaned}`);
      }
    }
  }

  return sections.join("\n\n");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { route } = req.query;

  if (!route || typeof route !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid route parameter" });
  }

  // Strip /salt/ prefix and map to docs path
  const cleanRoute = route.replace(/^\/salt\//, "");

  if (!cleanRoute || cleanRoute.startsWith("/") || cleanRoute.includes("..")) {
    return res.status(400).json({ error: "Invalid route" });
  }

  const filePath = path.resolve(docsDir, `${cleanRoute}.mdx`);

  // Security: ensure resolved path is within docs directory
  if (!filePath.startsWith(docsDir + path.sep)) {
    return res.status(400).json({ error: "Invalid route" });
  }

  try {
    const dirPath = path.dirname(filePath);
    const isComponentDir =
      dirPath !== docsDir &&
      TAB_ORDER.some((tab) =>
        fs.existsSync(path.join(dirPath, `${tab.file}.mdx`)),
      );

    if (isComponentDir) {
      const content = readComponentDirectory(dirPath);
      if (!content) {
        return res.status(404).json({ error: "No content found" });
      }
      return res.status(200).json({ content });
    }

    // Single file mode for non-component pages (patterns, foundations, etc.)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const content = cleanMdxContent(raw);
    return res.status(200).json({ content });
  } catch {
    return res.status(500).json({ error: "Failed to read file" });
  }
}
