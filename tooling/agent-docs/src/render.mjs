import path from "node:path";
import { toString as nodeText } from "mdast-util-to-string";
import {
  DROPPED_FRAGMENTS,
  GENERATED_MARKER,
  INDEX_SECTIONS,
  PACKAGE_DESCRIPTIONS,
  RELATIONSHIP_LABELS,
  SITE_ORIGIN,
  SUMMARY_MAX_LENGTH,
} from "./config.mjs";
import { docLink } from "./links.mjs";
import {
  convertMdx,
  demoteHeadings,
  parseMarkdown,
  stringifyMarkdown,
  stripFragments,
  u,
} from "./mdx.mjs";
import { placeExamples } from "./placement.mjs";

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

async function convertPage(page, doc, shared) {
  const ctx = {
    sitePath: page.sitePath,
    packageName: doc.packageName,
    docPath: doc.docPath,
    links: shared.links,
    examples: shared.examples,
    props: shared.props,
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

/** Renders a page's Markdown and any example files moved off it. */
function finishDocument(doc, children, summary) {
  const placed = placeExamples(children, {
    title: doc.title,
    docPath: doc.docPath,
  });
  return {
    markdown: stringifyMarkdown({ type: "root", children: placed.children }),
    summary,
    files: placed.files,
  };
}

export async function renderComponentDocument(doc, shared) {
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
    ...(await convertPage(doc.index, doc, shared)),
  ];
  for (const tab of doc.tabs) {
    const content = await convertPage(tab.page, doc, shared);
    if (content.length === 0) continue;
    children.push(
      u.heading(2, [u.text(tab.heading)]),
      ...demoteHeadings(content, 1),
    );
  }
  return finishDocument(
    doc,
    children,
    typeof doc.summary === "string" ? plainText(doc.summary) : "",
  );
}

export async function renderPageDocument(doc, shared) {
  const content = await convertPage(doc.page, doc, shared);
  const children = [
    u.heading(1, [u.text(doc.title)]),
    ...summaryNodes(doc, doc.page, shared),
    u.list([...commonFacts(doc, shared), websiteFact(doc)]),
    ...content,
  ];
  return finishDocument(
    doc,
    children,
    typeof doc.summary === "string"
      ? plainText(doc.summary)
      : firstParagraphText(content),
  );
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
