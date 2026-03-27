import type { GuideSnippet } from "../types.js";
import {
  cleanMarkdownText,
  escapeRegExp,
  uniqueStrings,
} from "./buildRegistryShared.js";

export function extractFirstParagraph(content: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("<"));

  const paragraphLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("#")) {
      if (paragraphLines.length > 0) {
        break;
      }
      continue;
    }

    if (line.startsWith("```")) {
      break;
    }

    paragraphLines.push(line);
    if (line.endsWith(".")) {
      break;
    }
  }

  return cleanMarkdownText(paragraphLines.join(" "));
}

function parseSection(content: string | null, heading: string): string {
  if (!content) {
    return "";
  }

  const lines = content.split(/\r?\n/);
  const headingMatcher = new RegExp(
    `^#{2,4}\\s+${escapeRegExp(heading)}\\s*$`,
    "i",
  );
  let startIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (headingMatcher.test(lines[index].trim())) {
      startIndex = index + 1;
      break;
    }
  }

  if (startIndex === -1) {
    return "";
  }

  const sectionLines: string[] = [];
  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();
    if (/^#{2,4}\s+/.test(trimmedLine)) {
      break;
    }
    sectionLines.push(lines[index]);
  }

  return sectionLines.join("\n");
}

export function extractStatementsFromSection(content: string): string[] {
  const statements: string[] = [];
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let activeBullet: string[] | null = null;
  let activeParagraph: string[] = [];

  const flushBullet = () => {
    if (!activeBullet) {
      return;
    }

    const statement = cleanMarkdownText(activeBullet.join(" "));
    if (statement.length > 0) {
      statements.push(statement);
    }
    activeBullet = null;
  };

  const flushParagraph = () => {
    if (activeParagraph.length === 0) {
      return;
    }

    const statement = cleanMarkdownText(activeParagraph.join(" "));
    if (statement.length > 0 && /[.!?]$/.test(statement)) {
      statements.push(statement);
    }
    activeParagraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence || line.startsWith("{/*")) {
      continue;
    }

    if (line.length === 0) {
      flushBullet();
      flushParagraph();
      continue;
    }

    if (line.startsWith("<")) {
      flushBullet();
      flushParagraph();
      continue;
    }

    if (/^#{2,6}\s+/.test(line)) {
      flushBullet();
      flushParagraph();
      continue;
    }

    const bulletMatch = line.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      flushBullet();
      flushParagraph();
      activeBullet = [bulletMatch[1]];
      continue;
    }

    if (activeBullet) {
      activeBullet.push(line);
      continue;
    }

    activeParagraph.push(line);
    if (/[.!?]$/.test(line)) {
      flushParagraph();
    }
  }

  flushBullet();
  flushParagraph();

  return uniqueStrings(
    statements
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0),
  );
}

export function parseSectionStatements(
  content: string | null,
  heading: string,
): string[] {
  const section = parseSection(content, heading);
  if (!section) {
    return [];
  }

  return extractStatementsFromSection(section);
}

export function parseStructuredGuidanceCallouts(content: string | null): {
  preferred: string[];
  avoid: string[];
} {
  if (!content) {
    return {
      preferred: [],
      avoid: [],
    };
  }

  const preferred: string[] = [];
  const avoid: string[] = [];
  const regex = /<(Callout|GuidanceCallout)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let match = regex.exec(content);
  while (match) {
    const attrs = match[2] ?? "";
    const body = match[3] ?? "";
    const guidanceAttr =
      attrs
        .match(/\bguidance="([^"]+)"/i)?.[1]
        ?.trim()
        .toLowerCase() ?? null;
    const typeAttr =
      attrs
        .match(/\btype="([^"]+)"/i)?.[1]
        ?.trim()
        .toLowerCase() ?? null;
    const statusAttr =
      attrs
        .match(/\bstatus="([^"]+)"/i)?.[1]
        ?.trim()
        .toLowerCase() ?? null;

    let bucket: "preferred" | "avoid" | null = null;
    if (guidanceAttr === "preferred" || guidanceAttr === "avoid") {
      bucket = guidanceAttr;
    } else if (
      typeAttr === "positive" ||
      statusAttr === "success" ||
      statusAttr === "positive"
    ) {
      bucket = "preferred";
    } else if (
      typeAttr === "negative" ||
      statusAttr === "warning" ||
      statusAttr === "danger" ||
      statusAttr === "error"
    ) {
      bucket = "avoid";
    }

    if (bucket) {
      const statements = extractStatementsFromSection(body);
      if (bucket === "preferred") {
        preferred.push(...statements);
      } else {
        avoid.push(...statements);
      }
    }

    match = regex.exec(content);
  }

  return {
    preferred: uniqueStrings(preferred),
    avoid: uniqueStrings(avoid),
  };
}

export function parseMarkdownSections(
  content: string,
  headingLevel: number,
): Array<{ title: string; content: string }> {
  const lines = content.split(/\r?\n/);
  const sections: Array<{ title: string; content: string }> = [];
  let activeSection: { title: string; lines: string[] } | null = null;

  const flushSection = () => {
    if (!activeSection) {
      return;
    }

    sections.push({
      title: cleanMarkdownText(activeSection.title),
      content: activeSection.lines.join("\n").trim(),
    });
    activeSection = null;
  };

  for (const line of lines) {
    const headingMatch = line.trim().match(/^(#{2,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      if (level === headingLevel) {
        flushSection();
        activeSection = {
          title: headingMatch[2],
          lines: [],
        };
        continue;
      }

      if (activeSection && level <= headingLevel) {
        flushSection();
      }
    }

    if (activeSection) {
      activeSection.lines.push(line);
    }
  }

  flushSection();
  return sections;
}

function normalizeGuideSnippetLanguage(
  value: string | null | undefined,
): GuideSnippet["language"] {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (normalized === "html") {
    return "html";
  }
  if (normalized === "css") {
    return "css";
  }
  if (
    normalized === "sh" ||
    normalized === "shell" ||
    normalized === "bash" ||
    normalized === "zsh"
  ) {
    return "shell";
  }

  return "tsx";
}

export function extractFencedCodeBlocks(
  content: string | null,
): Array<{ language: GuideSnippet["language"]; code: string }> {
  if (!content) {
    return [];
  }

  const blocks: Array<{ language: GuideSnippet["language"]; code: string }> =
    [];
  const regex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let match = regex.exec(content);
  while (match) {
    blocks.push({
      language: normalizeGuideSnippetLanguage(match[1]),
      code: match[2].trim(),
    });
    match = regex.exec(content);
  }

  return blocks;
}
