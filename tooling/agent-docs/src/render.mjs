import { readFile } from "node:fs/promises";
import path from "node:path";
import { toString as nodeText } from "mdast-util-to-string";
import {
  DROPPED_FRAGMENTS,
  GENERATED_MARKER,
  INDEX_SECTIONS,
  MAX_INLINE_STORY_FILE_BYTES,
  PACKAGE_DESCRIPTIONS,
  PATTERN_STORY_LINK,
  RELATIONSHIP_LABELS,
  SITE_ORIGIN,
  SUMMARY_MAX_LENGTH,
} from "./config.mjs";
import { listFiles, pathExists } from "./files.mjs";
import { docLink } from "./links.mjs";
import {
  convertMdx,
  demoteHeadings,
  parseMarkdown,
  stringifyMarkdown,
  stripFragments,
  u,
} from "./mdx.mjs";

export function summarize(text, maxLength = SUMMARY_MAX_LENGTH) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const window = clean.slice(0, maxLength);
  const sentenceEnd = window.lastIndexOf(". ");
  if (sentenceEnd > maxLength / 2) return window.slice(0, sentenceEnd + 1);
  const wordEnd = window.lastIndexOf(" ");
  return `${window.slice(0, wordEnd > 0 ? wordEnd : maxLength)}…`;
}

function plainText(markdown) {
  return nodeText(parseMarkdown(markdown));
}

function location(page, node) {
  const line = node?.position?.start?.line;
  return line
    ? `site/docs/${page.relativePath}:${line + page.lineOffset}`
    : `site/docs/${page.relativePath}`;
}

async function convertPage(page, doc, shared, shownSupport) {
  const ctx = {
    sitePath: page.sitePath,
    packageName: doc.packageName,
    docPath: doc.docPath,
    links: shared.links,
    examples: shared.examples,
    props: shared.props,
    shownSupport,
    referenceLink: (packageName, docPath) =>
      docLink({
        fromPackage: doc.packageName,
        fromDocPath: doc.docPath,
        toPackage: packageName,
        toDocPath: docPath,
      }),
    error: (node, message) =>
      shared.errors.push(`${location(page, node)}: ${message}`),
    warn: (node, message) =>
      shared.warnings.push(`${location(page, node)}: ${message}`),
    note: (node, message) =>
      shared.notes.push(`${location(page, node)}: ${message}`),
  };
  try {
    const { source, fragments } = stripFragments(page.body);
    for (const fragment of fragments) {
      if (!DROPPED_FRAGMENTS.has(path.posix.basename(fragment.src))) {
        shared.errors.push(
          `site/docs/${page.relativePath}:${fragment.line + page.lineOffset}: unsupported fragment ${fragment.src}. Handle it in tooling/agent-docs.`,
        );
      }
    }
    return await convertMdx(source, ctx);
  } catch (error) {
    const line = error?.place?.line ?? error?.line;
    shared.errors.push(
      `site/docs/${page.relativePath}${line ? `:${line + page.lineOffset}` : ""}: cannot parse MDX (${error.reason ?? error.message}).`,
    );
    return [];
  }
}

function fact(label, phrasing) {
  return u.listItem([u.paragraph([u.text(`${label}: `), ...phrasing])]);
}

function joinPhrasing(parts) {
  return parts.flatMap((part, index) =>
    index === 0 ? part : [u.text(", "), ...part],
  );
}

function referenceTo(doc, target, label) {
  return target
    ? [
        u.link(
          docLink({
            fromPackage: doc.packageName,
            fromDocPath: doc.docPath,
            toPackage: target.packageName,
            toDocPath: target.docPath,
          }),
          [u.text(label)],
        ),
      ]
    : [u.text(label)];
}

function commonFacts(doc, shared) {
  const version = shared.packages.get(doc.packageName)?.version;
  return [fact("Package", [u.inlineCode(`${doc.packageName}@${version}`)])];
}

function websiteFact(doc) {
  const url = `${SITE_ORIGIN}${doc.route}`;
  return fact("Website", [u.link(url, [u.text(url)])]);
}

function rewriteLinks(nodes, doc, page, shared) {
  const ctx = {
    sitePath: page.sitePath,
    packageName: doc.packageName,
    docPath: doc.docPath,
  };
  const visit = (parent) => {
    const children = [];
    for (const node of parent.children ?? []) {
      if (node.type === "link" || node.type === "definition") {
        const url = shared.links.resolve(node.url, ctx);
        if (url === null) {
          if (node.type === "link") children.push(...visit(node));
          continue;
        }
        node.url = url;
      }
      if (node.children) node.children = visit(node);
      children.push(node);
    }
    return children;
  };
  return visit({ children: nodes });
}

function summaryNodes(doc, page, shared) {
  return typeof doc.summary === "string" && doc.summary.trim()
    ? rewriteLinks(parseMarkdown(doc.summary).children, doc, page, shared)
    : [];
}

function isLabelParagraph(node) {
  return (
    node?.type === "paragraph" &&
    node.children.length === 1 &&
    node.children[0].type === "strong"
  );
}

/** The first paragraph, or a leading callout, summarizes a page without a description. */
function firstParagraphText(nodes) {
  const first = nodes.find(
    (node) => node.type === "paragraph" || node.type === "blockquote",
  );
  if (!first) return "";
  if (first.type === "paragraph") return nodeText(first);
  const paragraph = first.children.find(
    (child) => child.type === "paragraph" && !isLabelParagraph(child),
  );
  return paragraph ? nodeText(paragraph) : "";
}

export async function renderComponentDocument(doc, shared) {
  const shownSupport = new Set();
  const facts = commonFacts(doc, shared);
  if (doc.aliases.length > 0) {
    facts.push(fact("Also known as", [u.text(doc.aliases.join(", "))]));
  }
  const related = doc.relatedComponents
    .filter((item) => typeof item?.name === "string")
    .map((item) => {
      const label = RELATIONSHIP_LABELS[item.relationship];
      const target = shared.componentsByTitle.get(item.name.toLowerCase());
      return [
        ...referenceTo(doc, target, item.name),
        ...(label ? [u.text(` (${label})`)] : []),
      ];
    });
  if (related.length > 0) {
    facts.push(fact("Related components", joinPhrasing(related)));
  }
  const patterns = doc.relatedPatterns
    .filter((name) => typeof name === "string")
    .map((name) =>
      referenceTo(doc, shared.patternsByTitle.get(name.toLowerCase()), name),
    );
  if (patterns.length > 0) {
    facts.push(fact("Related patterns", joinPhrasing(patterns)));
  }
  facts.push(websiteFact(doc));

  const children = [
    u.heading(1, [u.text(doc.title)]),
    ...summaryNodes(doc, doc.index, shared),
    u.list(facts),
    ...(await convertPage(doc.index, doc, shared, shownSupport)),
  ];
  for (const tab of doc.tabs) {
    const content = await convertPage(tab.page, doc, shared, shownSupport);
    if (content.length === 0) continue;
    children.push(
      u.heading(2, [u.text(tab.heading)]),
      ...demoteHeadings(content, 1),
    );
  }
  return {
    markdown: stringifyMarkdown({ type: "root", children }),
    summary: typeof doc.summary === "string" ? plainText(doc.summary) : "",
  };
}

const STORY_LANGUAGES = { ".tsx": "tsx", ".ts": "ts", ".css": "css" };

/**
 * Pattern examples live in Storybook rather than on the site. The pattern's
 * Storybook link identifies its folder under packages/core/stories/patterns.
 */
async function patternStoryNodes(doc, shared) {
  if (!doc.route.startsWith("/salt/patterns/")) return [];
  const resources = doc.page.frontmatter.data?.resources;
  const linkedSlug = (Array.isArray(resources) ? resources : [])
    .map((resource) => PATTERN_STORY_LINK.exec(resource?.href ?? "")?.[1])
    .find(Boolean);
  // Without a Storybook link, a stories folder named like the page still counts.
  const slug = linkedSlug ?? path.posix.basename(doc.route);
  const directory = path.join(shared.patternStoriesDir, slug);
  if (!(await pathExists(directory))) {
    if (linkedSlug) {
      shared.warnings.push(
        `site/docs/${doc.page.relativePath}: no Storybook stories found in packages/core/stories/patterns/${slug}.`,
      );
    }
    return [];
  }
  const files = (
    await listFiles(directory, (file) => path.extname(file) in STORY_LANGUAGES)
  ).sort(
    (left, right) =>
      Number(right.endsWith(".stories.tsx")) -
        Number(left.endsWith(".stories.tsx")) || left.localeCompare(right),
  );
  const nodes = [
    u.heading(2, [u.text("Examples")]),
    u.paragraph([
      u.text(
        "Source of this pattern's Storybook examples. Each named export in a ",
      ),
      u.inlineCode(".stories.tsx"),
      u.text(
        " file is one example; the default export and Storybook types only configure Storybook.",
      ),
    ]),
  ];
  for (const file of files) {
    const content = await readFile(path.join(directory, file), "utf8");
    const bytes = Buffer.byteLength(content);
    const label = [u.text("File "), u.inlineCode(file)];
    if (bytes > MAX_INLINE_STORY_FILE_BYTES) {
      nodes.push(
        u.paragraph([
          ...label,
          u.text(` (${Math.round(bytes / 1024)} KB, not included).`),
        ]),
      );
    } else {
      nodes.push(
        u.paragraph([...label, u.text(":")]),
        u.code(STORY_LANGUAGES[path.extname(file)], content.trimEnd()),
      );
    }
  }
  return nodes;
}

export async function renderPageDocument(doc, shared) {
  const content = await convertPage(doc.page, doc, shared, new Set());
  const children = [
    u.heading(1, [u.text(doc.title)]),
    ...summaryNodes(doc, doc.page, shared),
    u.list([...commonFacts(doc, shared), websiteFact(doc)]),
    ...content,
    ...(await patternStoryNodes(doc, shared)),
  ];
  return {
    markdown: stringifyMarkdown({ type: "root", children }),
    summary:
      typeof doc.summary === "string"
        ? plainText(doc.summary)
        : firstParagraphText(content),
  };
}

function sectionFor(entry) {
  if (entry.section) return entry.section;
  return entry.docPath.split("/")[0].replace(/\.md$/, "");
}

/** Renders `docs/index.md` for one package. */
export function renderIndex({ packageName, version, entries, otherPackages }) {
  const lines = [
    GENERATED_MARKER,
    "",
    `# ${packageName} ${version} documentation`,
    "",
    `Generated from the Salt documentation site for \`${packageName}@${version}\`, the version installed with this file. Prefer these pages to prior knowledge of Salt: APIs and guidance change between versions.`,
    "",
    "- Read a component's page before using it. It covers usage guidance, props, examples and accessibility.",
    "- Use Salt components and patterns before writing custom markup or CSS, and style with Salt design tokens.",
    "- Links such as `@salt-ds/theme/docs/index.md` point to another Salt package's docs, found where packages are installed (usually `node_modules`). Only use Salt packages the project has installed.",
    "",
  ];
  for (const section of INDEX_SECTIONS) {
    const sectionEntries = entries
      .filter((entry) => sectionFor(entry) === section.key)
      .sort((left, right) => left.title.localeCompare(right.title));
    if (sectionEntries.length === 0) continue;
    lines.push(`## ${section.title}`, "");
    for (const entry of sectionEntries) {
      const summary = entry.summary ? `: ${summarize(entry.summary)}` : "";
      const aliases =
        entry.aliases?.length > 0
          ? ` Also known as: ${entry.aliases.join(", ")}.`
          : "";
      lines.push(`- [${entry.title}](${entry.docPath})${summary}${aliases}`);
    }
    lines.push("");
  }
  if (otherPackages.length > 0) {
    lines.push("## Other Salt packages", "");
    for (const other of otherPackages) {
      const description = PACKAGE_DESCRIPTIONS[other] ?? "";
      lines.push(
        `- \`${other}/docs/index.md\`${description ? `: ${description}` : ""}`,
      );
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
