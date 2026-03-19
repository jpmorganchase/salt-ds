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
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (
      line.length === 0 ||
      line.startsWith("<") ||
      line.startsWith("{/*") ||
      line.startsWith("```")
    ) {
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      statements.push(cleanMarkdownText(line));
      continue;
    }

    if (line.endsWith(".")) {
      statements.push(cleanMarkdownText(line));
    }
  }

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
