import { toString as nodeText } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
const markdownParser = unified().use(remarkParse).use(remarkGfm);
const serializer = unified()
  .use(remarkGfm, { tablePipeAlign: false })
  .use(remarkStringify, {
    bullet: "-",
    emphasis: "_",
    fences: true,
    listItemIndent: "one",
    rule: "-",
    strong: "*",
  });

export function parseMdx(source) {
  return mdxParser.parse(source);
}

const FRAGMENT_PATTERN = /^:fragment\{src=["']([^"']+)["']\}[ \t]*$/;

/**
 * Removes Mosaic `:fragment{src}` include lines, keeping line numbers, and
 * returns the included paths so callers can decide how to handle them.
 */
export function stripFragments(source) {
  const fragments = [];
  const lines = source.split("\n").map((line, index) => {
    const match = FRAGMENT_PATTERN.exec(line.trim());
    if (!match) return line;
    fragments.push({ src: match[1], line: index + 1 });
    return "";
  });
  return { source: lines.join("\n"), fragments };
}

export function parseMarkdown(source) {
  return markdownParser.parse(source);
}

export function stringifyMarkdown(root) {
  return serializer.stringify(root);
}

export const u = {
  text: (value) => ({ type: "text", value }),
  paragraph: (children) => ({ type: "paragraph", children }),
  strong: (children) => ({ type: "strong", children }),
  emphasis: (children) => ({ type: "emphasis", children }),
  inlineCode: (value) => ({ type: "inlineCode", value }),
  code: (lang, value) => ({ type: "code", lang, meta: null, value }),
  heading: (depth, children) => ({ type: "heading", depth, children }),
  list: (children) => ({
    type: "list",
    ordered: false,
    spread: false,
    children,
  }),
  listItem: (children) => ({ type: "listItem", spread: false, children }),
  blockquote: (children) => ({ type: "blockquote", children }),
  link: (url, children) => ({ type: "link", url, title: null, children }),
};

const PHRASING_TYPES = new Set([
  "text",
  "emphasis",
  "strong",
  "delete",
  "inlineCode",
  "break",
  "link",
  "linkReference",
  "image",
  "imageReference",
  "footnoteReference",
  "html",
]);

function isJsx(node) {
  return (
    node?.type === "mdxJsxFlowElement" || node?.type === "mdxJsxTextElement"
  );
}

function isBlank(nodes) {
  return nodes.every(
    (node) =>
      node.type === "text" &&
      node.value.trim() === "" &&
      !node.value.includes("\u00a0"),
  );
}

/** Wraps runs of phrasing content in paragraphs. */
export function asFlow(nodes) {
  const output = [];
  let run = [];
  const flush = () => {
    if (run.length > 0 && !isBlank(run)) output.push(u.paragraph(run));
    run = [];
  };
  for (const node of nodes) {
    if (PHRASING_TYPES.has(node.type)) {
      run.push(node);
    } else {
      flush();
      output.push(node);
    }
  }
  flush();
  return output;
}

/** Flattens flow content into phrasing, separating blocks with spaces. */
export function asPhrasing(nodes) {
  const output = [];
  let previousWasBlock = false;
  for (const node of nodes) {
    const isBlock = !PHRASING_TYPES.has(node.type);
    let phrasing;
    if (!isBlock) phrasing = [node];
    else if (node.type === "paragraph" || node.type === "heading")
      phrasing = node.children;
    else if (node.type === "code") phrasing = [u.inlineCode(node.value)];
    else phrasing = [u.text(nodeText(node))];
    if (phrasing.length === 0) continue;
    if (output.length > 0 && (isBlock || previousWasBlock)) {
      output.push(u.text(" "));
    }
    output.push(...phrasing);
    previousWasBlock = isBlock;
  }
  return output;
}

function attributes(node) {
  const result = {};
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== "mdxJsxAttribute") continue;
    const { value } = attribute;
    if (value === null || value === undefined) result[attribute.name] = true;
    else if (typeof value === "string") result[attribute.name] = value;
    else result[attribute.name] = { expression: value.value };
  }
  return result;
}

function stringLiterals(expression) {
  return [
    ...expression.matchAll(
      /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`]*)`/g,
    ),
  ].map((match) => match[1] ?? match[2] ?? match[3]);
}

function attributeString(attrs, name) {
  const value = attrs[name];
  if (typeof value === "string") return value;
  if (value?.expression) {
    const literals = stringLiterals(value.expression);
    if (literals.length === 1) return literals[0];
  }
  return undefined;
}

function attributeStrings(attrs, name) {
  const value = attrs[name];
  if (typeof value === "string") return [value];
  if (value?.expression) return stringLiterals(value.expression);
  return [];
}

function flowOrPhrasing(node, children) {
  return node.type === "mdxJsxTextElement"
    ? asPhrasing(children)
    : asFlow(children);
}

function markdownFlow(markdown) {
  return parseMarkdown(markdown).children;
}

export function markdownPhrasing(markdown) {
  return asPhrasing(markdownFlow(markdown.replace(/\s*\n\s*/g, " ")));
}

async function transformChildren(node, ctx) {
  const output = [];
  for (const child of node.children ?? []) {
    output.push(...(await transformNode(child, ctx)));
  }
  return output;
}

function imageNodes(node, alt, hidden, caption) {
  const description = hidden ? "" : (alt?.trim() ?? "");
  const captionText = caption?.trim() ?? "";
  if (!description && !captionText) return [];
  const phrasing = [];
  if (description) phrasing.push(u.emphasis([u.text(`Image: ${description}`)]));
  if (captionText) {
    if (phrasing.length > 0) phrasing.push(u.text(" "));
    phrasing.push(u.text(captionText));
  }
  return node.type === "mdxJsxTextElement" || node.type === "image"
    ? phrasing
    : [u.paragraph(phrasing)];
}

async function transformNode(node, ctx) {
  switch (node.type) {
    case "mdxjsEsm":
      return [];
    case "mdxFlowExpression":
    case "mdxTextExpression":
      return expressionNodes(node, ctx);
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      return jsxNodes(node, ctx);
    case "image":
      if (!node.alt?.trim()) {
        ctx.note(node, `Image ${node.url} has no alt text.`);
      }
      return imageNodes(node, node.alt, false);
    case "html":
      return [];
    default:
      break;
  }
  if (node.children) node.children = await transformChildren(node, ctx);
  if (node.type === "paragraph" && isBlank(node.children)) return [];
  if (node.type === "link" || node.type === "definition") {
    const url = ctx.links.resolve(node.url, ctx);
    if (url === null) return node.type === "link" ? node.children : [];
    node.url = url;
  }
  return [node];
}

function expressionNodes(node, ctx) {
  const value = node.value.trim();
  if (value === "" || (value.startsWith("/*") && value.endsWith("*/"))) {
    return [];
  }
  const literal = /^(["'`])([\s\S]*)\1$/.exec(value);
  if (literal) {
    return node.type === "mdxTextExpression"
      ? [u.text(literal[2])]
      : [u.paragraph([u.text(literal[2])])];
  }
  ctx.warn(node, `Dropped MDX expression {${value.slice(0, 40)}}.`);
  return [];
}

async function unwrap(node, ctx) {
  return flowOrPhrasing(node, await transformChildren(node, ctx));
}

async function livePreview(node, ctx) {
  const attrs = attributes(node);
  const componentName = attributeString(attrs, "componentName");
  const exampleName = attributeString(attrs, "exampleName");
  if (!componentName || !exampleName) {
    ctx.error(node, "LivePreview requires componentName and exampleName.");
    return [];
  }
  const example = await ctx.examples.resolve(componentName, exampleName);
  if (example.error) {
    ctx.error(node, example.error);
    return [];
  }
  const nodes = [
    u.paragraph([
      u.emphasis([u.text("Example:")]),
      u.text(" "),
      u.inlineCode(exampleName),
    ]),
    u.code(example.entry.language, example.entry.code.trimEnd()),
  ];
  for (const file of example.support) {
    const label = [u.text("Supporting file "), u.inlineCode(file.displayPath)];
    if (file.kind === "file") {
      if (ctx.shownSupport.has(file.absolutePath)) {
        nodes.push(u.paragraph([...label, u.text(" is shown above.")]));
      } else {
        ctx.shownSupport.add(file.absolutePath);
        nodes.push(u.paragraph([...label, u.text(":")]));
        nodes.push(u.code(file.language, file.code.trimEnd()));
      }
    } else if (file.kind === "omitted") {
      const size = Math.round(file.bytes / 1024);
      nodes.push(
        u.paragraph([
          ...label,
          u.text(` (${size} KB of example data, not included).`),
        ]),
      );
    } else if (file.kind === "asset") {
      nodes.push(
        u.paragraph([
          u.text("Asset "),
          u.inlineCode(file.displayPath),
          u.text(" (not included)."),
        ]),
      );
    } else {
      nodes.push(
        u.paragraph([
          u.text("Site helper "),
          u.inlineCode(file.displayPath),
          u.text(" (not included)."),
        ]),
      );
    }
  }
  if (node.type === "mdxJsxTextElement") {
    ctx.error(node, "LivePreview must be on its own line.");
    return [];
  }
  return nodes;
}

function splitJsDocTags(description) {
  const main = [];
  const tags = [];
  let current;
  for (const line of description.split("\n")) {
    const match = /^@([A-Za-z]+)\s*(.*)$/.exec(line.trim());
    if (match) {
      current = { name: match[1], lines: [match[2]] };
      tags.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      main.push(line);
    }
  }
  return {
    text: main.join("\n").trim(),
    tags: new Map(
      tags.map(({ name, lines }) => [name, lines.join("\n").trim()]),
    ),
  };
}

function firstParagraph(text) {
  return text.split(/\n\s*\n/)[0].trim();
}

function propDescription(tags, text) {
  const phrasing = [];
  if (tags.has("deprecated")) {
    phrasing.push(u.strong([u.text("Deprecated")]), u.text(" "));
    phrasing.push(...markdownPhrasing(firstParagraph(tags.get("deprecated"))));
    if (text) phrasing.push(u.text(" "));
  }
  if (text) phrasing.push(...markdownPhrasing(text));
  if (tags.has("since")) phrasing.push(u.text(` Since ${tags.get("since")}`));
  return phrasing.length > 0 ? phrasing : [u.text("-")];
}

const MAX_ENUM_VALUES = 12;

function propType(type) {
  if (type?.name !== "enum") return type?.name ?? "";
  if (
    Array.isArray(type.value) &&
    type.value.length > 0 &&
    type.value.length <= MAX_ENUM_VALUES
  ) {
    return type.value.map((item) => item.value).join(" | ");
  }
  return type.raw ?? type.name;
}

function propDefault(prop, tags) {
  const value = prop.defaultValue?.value ?? tags.get("default");
  return value === undefined || value === null || value === ""
    ? [u.text("-")]
    : [u.inlineCode(String(value))];
}

function tableNode(rows) {
  const width = Math.max(...rows.map((row) => row.length));
  return {
    type: "table",
    align: Array.from({ length: width }, () => null),
    children: rows.map((cells) => ({
      type: "tableRow",
      children: Array.from({ length: width }, (_, index) => ({
        type: "tableCell",
        children: cells[index] ?? [],
      })),
    })),
  };
}

async function propsTable(node, ctx) {
  const attrs = attributes(node);
  const packageDirectory = attributeString(attrs, "packageName") ?? "core";
  const componentName = attributeString(attrs, "componentName");
  const component = componentName
    ? ctx.props.get(packageDirectory, componentName)
    : undefined;
  if (!component) {
    // The site renders nothing in this case, so this is not fatal.
    ctx.warn(
      node,
      `No props found for ${componentName} in packages/${packageDirectory}.`,
    );
    return [];
  }
  const props = Object.values(component.props ?? {});
  if (props.length === 0) return [];
  const rows = [
    [
      [u.text("Prop")],
      [u.text("Type")],
      [u.text("Default")],
      [u.text("Description")],
    ],
    ...props.map((prop) => {
      const { text, tags } = splitJsDocTags(prop.description ?? "");
      return [
        prop.required
          ? [u.inlineCode(prop.name), u.text(" (required)")]
          : [u.inlineCode(prop.name)],
        [u.inlineCode(propType(prop.type))],
        propDefault(prop, tags),
        propDescription(tags, text),
      ];
    }),
  ];
  return [tableNode(rows)];
}

async function keyboardControlItem(node, ctx) {
  const keys = attributeStrings(attributes(node), "keyOrCombos");
  const label = keys.length > 0 ? keys.join(" or ") : "Keys";
  return u.listItem([
    u.paragraph([u.strong([u.text(label)])]),
    ...asFlow(await transformChildren(node, ctx)),
  ]);
}

async function keyboardControls(node, ctx) {
  const items = [];
  for (const child of node.children ?? []) {
    if (isJsx(child) && child.name === "KeyboardControl") {
      items.push(await keyboardControlItem(child, ctx));
    } else {
      const other = await transformNode(child, ctx);
      if (!isBlank(asPhrasing(other))) {
        ctx.error(child, "KeyboardControls may only contain KeyboardControl.");
      }
    }
  }
  return items.length > 0 ? [u.list(items)] : [];
}

async function guidanceCallout(node, ctx) {
  const attrs = attributes(node);
  const type = attributeString(attrs, "type");
  const label =
    attributeString(attrs, "customPillText") ??
    (type === "positive" ? "Do" : type === "negative" ? "Don't" : undefined);
  const children = asFlow(await transformChildren(node, ctx));
  return [
    u.blockquote(
      label
        ? [u.paragraph([u.strong([u.text(label)])]), ...children]
        : children,
    ),
  ];
}

async function callout(node, ctx) {
  const attrs = attributes(node);
  const status = attributeString(attrs, "status");
  const title =
    attributeString(attrs, "title") ??
    (status === "warning"
      ? "Warning"
      : status === "error"
        ? "Important"
        : undefined);
  const children = asFlow(await transformChildren(node, ctx));
  return [
    u.blockquote(
      title
        ? [u.paragraph([u.strong([u.text(title)])]), ...children]
        : children,
    ),
  ];
}

async function imageElement(node, ctx) {
  const attrs = attributes(node);
  const alt = attributeString(attrs, "alt");
  const hidden =
    attributeString(attrs, "aria-hidden") === "true" ||
    attrs["aria-hidden"] === true;
  if (!hidden && !alt?.trim()) {
    ctx.note(
      node,
      `<${node.name}> ${attributeString(attrs, "src") ?? ""} has no alt text.`,
    );
  }
  return imageNodes(node, alt, hidden, attributeString(attrs, "caption"));
}

async function imageSwitcher(node, ctx) {
  const attrs = attributes(node);
  const images = attrs.images;
  const altMatches = images?.expression
    ? [...images.expression.matchAll(/\balt\s*:\s*(["'`])((?:(?!\1).)*)\1/g)]
    : [];
  const alts = altMatches.map((match) => match[2].trim()).filter(Boolean);
  const missing = altMatches.length - alts.length;
  if (missing > 0) {
    ctx.note(node, `ImageSwitcher has ${missing} image(s) without alt text.`);
  }
  const caption = attributeString(attrs, "caption")?.trim();
  const phrasing = [];
  if (alts.length > 0) {
    phrasing.push(u.emphasis([u.text(`Images: ${alts.join("; ")}`)]));
  }
  if (caption) {
    if (phrasing.length > 0) phrasing.push(u.text(" "));
    phrasing.push(u.text(caption));
  }
  return phrasing.length > 0 ? [u.paragraph(phrasing)] : [];
}

async function tokenTable(node, ctx) {
  const tokens = attributeStrings(attributes(node), "tokens");
  if (tokens.length === 0) {
    ctx.error(node, "TokenTableWithControls requires tokens.");
    return [];
  }
  const phrasing = [u.text(tokens.length === 1 ? "Token: " : "Tokens: ")];
  tokens.forEach((token, index) => {
    if (index > 0) phrasing.push(u.text(", "));
    phrasing.push(u.inlineCode(token));
  });
  phrasing.push(
    u.text(" ("),
    u.link(ctx.referenceLink("@salt-ds/theme", "tokens.md"), [
      u.text("token reference"),
    ]),
    u.text(")."),
  );
  return [u.paragraph(phrasing)];
}

async function colorIndicator(node) {
  const color = attributeString(attributes(node), "fillColor");
  return color ? [u.text(color)] : [];
}

async function kbd(node) {
  return [u.inlineCode(nodeText(node))];
}

async function quickLinkItem(node, ctx) {
  const attrs = attributes(node);
  const title = attributeString(attrs, "title") ?? "Link";
  const href = attributeString(attrs, "href");
  const url = href ? ctx.links.resolve(href, ctx) : null;
  const heading = url ? [u.link(url, [u.text(title)])] : [u.text(title)];
  const description = asPhrasing(await transformChildren(node, ctx));
  return u.listItem([
    u.paragraph(
      description.length > 0
        ? [...heading, u.text(": "), ...description]
        : heading,
    ),
  ]);
}

async function quickLinks(node, ctx) {
  const items = [];
  for (const child of node.children ?? []) {
    if (isJsx(child) && child.name === "QuickLink") {
      items.push(await quickLinkItem(child, ctx));
    }
  }
  return items.length > 0 ? [u.list(items)] : [];
}

async function disclosure(node, ctx) {
  const summary = attributeString(attributes(node), "summary");
  const children = asFlow(await transformChildren(node, ctx));
  return summary
    ? [u.paragraph([u.strong([u.text(summary)])]), ...children]
    : children;
}

/** Replaces an interactive site gallery with a link to generated reference docs. */
function referenceTo(packageName, docPath, before, label) {
  return async (_node, ctx) => [
    u.paragraph([
      u.text(before),
      u.link(ctx.referenceLink(packageName, docPath), [u.text(label)]),
      u.text("."),
    ]),
  ];
}

const ROW_PATTERN = /^(TR|tr)$/;
const CELL_PATTERN = /^(TH|TD|th|td)$/;

/** Collapses JSX source indentation inside table cells. */
function collapseWhitespace(phrasing) {
  const output = phrasing.map((node) =>
    node.type === "text"
      ? { ...node, value: node.value.replace(/\s+/g, " ") }
      : node,
  );
  const first = output[0];
  if (first?.type === "text") first.value = first.value.trimStart();
  const last = output.at(-1);
  if (last?.type === "text") last.value = last.value.trimEnd();
  return output.filter((node) => node.type !== "text" || node.value !== "");
}

async function tableElement(node, ctx) {
  const rows = [];
  async function collectCells(row) {
    const cells = [];
    async function visit(parent) {
      for (const child of parent.children ?? []) {
        if (isJsx(child) && CELL_PATTERN.test(child.name)) {
          cells.push(
            collapseWhitespace(asPhrasing(await transformChildren(child, ctx))),
          );
        } else if (child.children) {
          await visit(child);
        }
      }
    }
    await visit(row);
    return cells;
  }
  async function visit(parent) {
    for (const child of parent.children ?? []) {
      if (isJsx(child) && ROW_PATTERN.test(child.name)) {
        rows.push(await collectCells(child));
      } else if (child.children) {
        await visit(child);
      }
    }
  }
  await visit(node);
  if (rows.length === 0) return [];
  return [tableNode(rows)];
}

async function htmlLink(node, ctx) {
  const href = attributeString(attributes(node), "href");
  const children = asPhrasing(await transformChildren(node, ctx));
  const url = href ? ctx.links.resolve(href, ctx) : null;
  const phrasing = url ? [u.link(url, children)] : children;
  return node.type === "mdxJsxTextElement" ? phrasing : [u.paragraph(phrasing)];
}

async function htmlList(node, ctx) {
  const items = [];
  for (const child of node.children ?? []) {
    if (isJsx(child) && child.name === "li") {
      items.push(u.listItem(asFlow(await transformChildren(child, ctx))));
    }
  }
  return items.length > 0
    ? [{ ...u.list(items), ordered: node.name === "ol" }]
    : [];
}

function wrapPhrasing(factory) {
  return async (node, ctx) => {
    const phrasing = [factory(asPhrasing(await transformChildren(node, ctx)))];
    return node.type === "mdxJsxTextElement"
      ? phrasing
      : [u.paragraph(phrasing)];
  };
}

async function htmlHeading(node, ctx) {
  const depth = Number(node.name.slice(1));
  return [u.heading(depth, asPhrasing(await transformChildren(node, ctx)))];
}

const HANDLERS = {
  AGThemeProvider: unwrap,
  AgEnterpriseFeature: unwrap,
  AllTokens: referenceTo(
    "@salt-ds/theme",
    "tokens.md",
    "Every token is listed in the ",
    "design tokens reference",
  ),
  Callout: callout,
  ColorIndicator: colorIndicator,
  CountrySymbolPreview: referenceTo(
    "@salt-ds/countries",
    "country-symbols.md",
    "Every country symbol is listed in the ",
    "country symbol list",
  ),
  Diagram: imageElement,
  Diagrams: unwrap,
  Disclosure: disclosure,
  FoundationColorView: referenceTo(
    "@salt-ds/theme",
    "tokens.md",
    "Color tokens are listed in the ",
    "design tokens reference",
  ),
  GuidanceCallout: guidanceCallout,
  IconPreview: referenceTo(
    "@salt-ds/icons",
    "icons.md",
    "Every icon is listed in the ",
    "icon list",
  ),
  Image: imageElement,
  ImageSwitcher: imageSwitcher,
  Kbd: kbd,
  KeyboardControl: async (node, ctx) => [
    u.list([await keyboardControlItem(node, ctx)]),
  ],
  KeyboardControls: keyboardControls,
  LivePreview: livePreview,
  OverviewList: async (_node, ctx) => [
    u.paragraph([
      u.text("See the "),
      u.link(ctx.referenceLink(ctx.packageName, "index.md"), [
        u.text("documentation index"),
      ]),
      u.text(" for the full list."),
    ]),
  ],
  PropsTable: propsTable,
  QuickLink: async (node, ctx) => [u.list([await quickLinkItem(node, ctx)])],
  QuickLinks: quickLinks,
  ReactResizablePanelsThemeProvider: unwrap,
  Table: tableElement,
  TokenTableWithControls: tokenTable,
  a: htmlLink,
  b: wrapPhrasing(u.strong),
  br: async (node) =>
    node.type === "mdxJsxTextElement" ? [{ type: "break" }] : [],
  code: async (node) => {
    const phrasing = [u.inlineCode(nodeText(node))];
    return node.type === "mdxJsxTextElement"
      ? phrasing
      : [u.paragraph(phrasing)];
  },
  em: wrapPhrasing(u.emphasis),
  h1: htmlHeading,
  h2: htmlHeading,
  h3: htmlHeading,
  h4: htmlHeading,
  h5: htmlHeading,
  h6: htmlHeading,
  hr: async () => [{ type: "thematicBreak" }],
  i: wrapPhrasing(u.emphasis),
  img: imageElement,
  kbd,
  ol: htmlList,
  strong: wrapPhrasing(u.strong),
  table: tableElement,
  ul: htmlList,
};

const UNWRAPPED_HTML = new Set([
  "abbr",
  "article",
  "center",
  "details",
  "div",
  "figcaption",
  "figure",
  "footer",
  "header",
  "label",
  "main",
  "p",
  "section",
  "small",
  "span",
  "sub",
  "summary",
  "sup",
  "u",
]);

async function jsxNodes(node, ctx) {
  if (!node.name) return unwrap(node, ctx);
  const handler =
    HANDLERS[node.name] ?? (UNWRAPPED_HTML.has(node.name) ? unwrap : undefined);
  if (!handler) {
    ctx.error(
      node,
      `Unsupported MDX component <${node.name}>. Add a handler to tooling/agent-docs/src/mdx.mjs.`,
    );
    return [];
  }
  return handler(node, ctx);
}

/**
 * Converts an MDX tree to plain Markdown nodes in place and returns its
 * top-level children. `ctx` supplies link, example and props resolution
 * plus `error`/`warn` reporters.
 */
export async function convertMdx(source, ctx) {
  const tree = parseMdx(source);
  return transformChildren(tree, ctx);
}

export function demoteHeadings(nodes, levels) {
  for (const node of nodes) {
    if (node.type === "heading") node.depth = Math.min(6, node.depth + levels);
  }
  return nodes;
}
