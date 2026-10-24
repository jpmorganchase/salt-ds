import { toString as nodeText } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { formatPropType } from "../../../site/src/components/components/formatPropType.mjs";

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

/** Placeholder node for a LivePreview example, rendered by `placeExamples`. */
export const EXAMPLE_NODE = "agentDocsExample";

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

/** `name`, `name="true"` and `name={true}` are all true. */
function attributeTrue(attrs, name) {
  const value = attrs[name];
  return (
    value === true ||
    attributeString(attrs, name) === "true" ||
    value?.expression?.trim() === "true"
  );
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

const sameText = (left, right) => {
  const key = (text) =>
    text
      .toLowerCase()
      .replace(/[\s.]+$/, "")
      .trim();
  return key(left) === key(right);
};

function imageNodes(node, alt, hidden, caption) {
  const description = hidden ? "" : (alt?.trim() ?? "");
  const captionText = caption?.trim() ?? "";
  if (!description && !captionText) return [];
  const phrasing = [];
  if (description) phrasing.push(u.emphasis([u.text(`Image: ${description}`)]));
  // A caption that repeats the alt text adds nothing.
  if (captionText && !(description && sameText(description, captionText))) {
    if (phrasing.length > 0) phrasing.push(u.text(" "));
    phrasing.push(u.text(captionText));
  }
  return node.type === "mdxJsxTextElement" || node.type === "image"
    ? phrasing
    : [u.paragraph(phrasing)];
}

/**
 * An inline code token, followed by a note when it is deprecated, so that a
 * page still listing a deprecated token doesn't lead agents to use it.
 */
function tokenCode(value, node, ctx) {
  const code = u.inlineCode(value);
  const replacements = ctx.deprecatedToken?.(value);
  if (!replacements) return [code];
  const use = replacements.flatMap((name, index) => [
    ...(index > 0 ? [u.text(" or ")] : []),
    u.inlineCode(name),
  ]);
  ctx.note(
    node,
    `${value} is deprecated${replacements.length > 0 ? `; use ${replacements.join(" or ")}` : ""}. The docs for agents say so where the page names it.`,
  );
  return [
    code,
    u.text(replacements.length > 0 ? " (deprecated; use " : " (deprecated)"),
    ...use,
    ...(replacements.length > 0 ? [u.text(")")] : []),
  ];
}

async function transformNode(node, ctx) {
  switch (node.type) {
    case "inlineCode":
      return tokenCode(node.value, node, ctx);
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
    const url = ctx.links.resolve(node.url, ctx, node);
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
  // Overview pages list the pages below them with `meta.data.items`.
  if (
    node.type === "mdxFlowExpression" &&
    /\bmeta\.data\.items\b/.test(value) &&
    ctx.childPages
  ) {
    const list = ctx.childPages();
    if (list.length > 0) return list;
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
  if (node.type === "mdxJsxTextElement") {
    ctx.error(node, "LivePreview must be on its own line.");
    return [];
  }
  const example = await ctx.examples.resolve(componentName, exampleName);
  if (example.error) {
    ctx.error(node, example.error);
    return [];
  }
  // Agents copy examples, so they shouldn't use deprecated tokens.
  const sources = [example.entry, ...example.support].filter(
    ({ code }) => code,
  );
  for (const token of new Set(
    sources.flatMap(({ code }) => code.match(/--salt-[A-Za-z0-9-]+/g) ?? []),
  )) {
    const replacements = ctx.deprecatedToken?.(token);
    if (replacements) {
      ctx.note(
        node,
        `Example ${componentName}/${exampleName} uses the deprecated token ${token}${replacements.length > 0 ? `; use ${replacements.join(" or ")}` : ""}.`,
      );
    }
  }
  // Rendered once the whole page is known; see `placeExamples`.
  return [
    {
      type: EXAMPLE_NODE,
      name: exampleName,
      entry: example.entry,
      support: example.support,
    },
  ];
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

/** A prop's `@deprecated` text, first paragraph only, or undefined. */
export function deprecationOf(description = "") {
  const { tags } = splitJsDocTags(description);
  return tags.has("deprecated")
    ? firstParagraph(tags.get("deprecated")) || "Deprecated."
    : undefined;
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

// At most this many element-specific attributes are named.
const MAX_INHERITED_NAMES = 6;

/** Phrasing joined as "a, b and c". */
function joinPhrasing(groups) {
  return groups.flatMap((group, index) => [
    ...(index === 0
      ? []
      : [u.text(index === groups.length - 1 ? " and " : ", ")]),
    ...group,
  ]);
}

function codeList(names) {
  return joinPhrasing(names.map((name) => [u.inlineCode(name)]));
}

/**
 * What a component inherits from React's types, which tables leave out:
 * "`<td>` attributes, such as `colSpan`, and `ref`". docgen credits an
 * attribute several elements declare to one of them, such as
 * ButtonHTMLAttributes for a textarea's value or SVGAttributes for a link's
 * href, so the element is named only from the props interface: `elements`,
 * such as ["td"]. Every element-specific name docgen reports is listed.
 */
function inheritedPhrasing(inherited = {}, elements = []) {
  const svg = elements.length === 1 && elements[0] === "svg";
  const specific = [
    ...new Set(
      Object.entries(inherited)
        .filter(
          ([name]) =>
            (/^\w+HTMLAttributes$/.test(name) &&
              name !== "HTMLAttributes" &&
              name !== "AllHTMLAttributes") ||
            (name === "SVGAttributes" && !svg),
        )
        .flatMap(([, names]) => names),
    ),
  ];
  const general = Boolean(
    inherited.HTMLAttributes ||
      inherited.AllHTMLAttributes ||
      inherited.AriaAttributes ||
      inherited.DOMAttributes ||
      (svg && inherited.SVGAttributes),
  );
  const groups = [];
  if (specific.length > 0 || general) {
    const names = specific.slice(0, MAX_INHERITED_NAMES);
    groups.push([
      ...(elements.length === 1
        ? [u.inlineCode(`<${elements[0]}>`), u.text(" attributes")]
        : [u.text("HTML attributes")]),
      ...(names.length > 0 ? [u.text(", such as "), ...codeList(names)] : []),
    ]);
  }
  if (inherited.RefAttributes) groups.push([u.inlineCode("ref")]);
  if (groups.length === 0) return undefined;
  // "…, such as `a` and `b`, and `ref`": a comma before ref after a list.
  return groups.length === 2 && specific.length > 0
    ? [...groups[0], u.text(", and "), ...groups[1]]
    : joinPhrasing(groups);
}

/** "Types in this table: `Value` is `string | number`; …", or undefined. */
function typesPhrasing(definitions) {
  if (definitions.length === 0) return undefined;
  const items = definitions.map((definition) => {
    if (definition.kind === "parameter") {
      return [
        u.inlineCode(definition.name),
        u.text(" is a type parameter"),
        ...(definition.constraint
          ? [
              u.text(" ("),
              u.inlineCode(`extends ${definition.constraint}`),
              u.text(")"),
            ]
          : []),
        u.text(" inferred from the props you pass"),
      ];
    }
    return definition.text === undefined
      ? [
          u.inlineCode(definition.signature),
          u.text(" is in the type declarations of "),
          u.inlineCode(`@salt-ds/${definition.packageDirectory}`),
        ]
      : [
          u.inlineCode(definition.signature),
          u.text(" is "),
          u.inlineCode(definition.text),
        ];
  });
  return [
    u.text("Types in this table: "),
    ...items.flatMap((item, index) => [
      ...(index === 0 ? [] : [u.text("; ")]),
      ...item,
    ]),
    u.text("."),
  ];
}

/**
 * A component's props table, what it inherits and the Salt types the table
 * names.
 */
function componentApi(componentName, component, packageDirectory, ctx) {
  const props = Object.values(component.props ?? {});
  const inherited = inheritedPhrasing(
    component.inherited,
    ctx.props.elementsOf?.(packageDirectory, component),
  );
  const nodes = [];
  // Sentences for the paragraph after the table.
  const notes = [];
  if (props.length === 0) {
    // The tables leave out inherited React and native props, as on the site,
    // where an empty table shows nothing. Say so rather than leave a heading
    // with nothing under it.
    notes.push([
      u.inlineCode(componentName),
      ...(inherited
        ? [
            u.text(" has no props of its own. It accepts "),
            ...inherited,
            u.text("."),
          ]
        : [
            u.text(
              " has no props of its own. It accepts the props of the element it renders; see its type declarations.",
            ),
          ]),
    ]);
  } else {
    nodes.push(
      tableNode([
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
            [u.inlineCode(formatPropType(prop.type))],
            propDefault(prop, tags),
            propDescription(tags, text),
          ];
        }),
      ]),
    );
    if (inherited) {
      notes.push([
        u.text("It also accepts "),
        ...inherited,
        u.text(", which the table leaves out."),
      ]);
    }
    // Each type is defined once per page, under the first table naming it.
    ctx.definedTypes ??= new Set();
    const types = typesPhrasing(
      ctx.props.typeDefinitions?.(
        packageDirectory,
        component,
        props.map((prop) => formatPropType(prop.type)),
        ctx.definedTypes,
      ) ?? [],
    );
    if (types) notes.push(types);
  }
  // One paragraph after the table, so the notes add little to the page's
  // length and don't push its examples off it.
  if (notes.length > 0) {
    nodes.push(
      u.paragraph(
        notes.flatMap((note, index) => [
          ...(index === 0 ? [] : [u.text(" ")]),
          ...note,
        ]),
      ),
    );
  }
  return nodes;
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
  ctx.recordComponent?.(componentName, packageDirectory);
  const nodes = componentApi(componentName, component, packageDirectory, ctx);
  // Exported parts the site gives no table, such as DrawerCloseButton.
  for (const name of ctx.subcomponents?.(packageDirectory, componentName) ??
    []) {
    const part = ctx.props.get(packageDirectory, name);
    if (!part) continue;
    ctx.recordComponent?.(name, packageDirectory);
    nodes.push(
      u.paragraph([
        u.strong([u.inlineCode(name)]),
        u.text(", exported with "),
        u.inlineCode(componentName),
        u.text(":"),
      ]),
      ...componentApi(name, part, packageDirectory, ctx),
    );
  }
  return nodes;
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
  const hidden = attributeTrue(attrs, "aria-hidden");
  if (!hidden && !alt?.trim()) {
    ctx.note(
      node,
      `<${node.name}> ${attributeString(attrs, "src") ?? ""} has no alt text.`,
    );
  }
  return imageNodes(node, alt, hidden, attributeString(attrs, "caption"));
}

async function diagram(node, ctx) {
  const image = await imageElement(node, ctx);
  const children = await transformChildren(node, ctx);
  const contentPosition = attributeString(attributes(node), "contentPosition");
  return flowOrPhrasing(
    node,
    contentPosition === "bottom"
      ? [...image, ...children]
      : [...children, ...image],
  );
}

async function agEnterpriseFeature(node) {
  return flowOrPhrasing(node, [
    u.text("an "),
    u.link("https://www.ag-grid.com/react-data-grid/community-vs-enterprise/", [
      u.text("ag grid enterprise"),
    ]),
    u.text(" feature"),
  ]);
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
    phrasing.push(...tokenCode(token, node, ctx));
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
  const description = asPhrasing(await transformChildren(node, ctx));
  return quickLinkItemNodes({ title, href, description }, ctx, node);
}

function quickLinkItemNodes({ title, href, description }, ctx, node) {
  const url = href ? ctx.links.resolve(href, ctx, node) : null;
  const heading = url ? [u.link(url, [u.text(title)])] : [u.text(title)];
  return u.listItem([
    u.paragraph(
      description.length > 0
        ? [...heading, u.text(": "), ...description]
        : heading,
    ),
  ]);
}

/** Reads the MDX parser's syntax tree without executing author expressions. */
function literalQuickLinks(attribute) {
  const expression = attribute.value?.data?.estree?.body?.[0]?.expression;
  if (expression?.type !== "ArrayExpression") return undefined;
  const links = [];
  for (const element of expression.elements) {
    if (element?.type !== "ObjectExpression") return undefined;
    const link = Object.create(null);
    for (const property of element.properties) {
      if (
        property.type !== "Property" ||
        property.kind !== "init" ||
        property.computed ||
        property.method ||
        property.value.type !== "Literal" ||
        typeof property.value.value !== "string"
      ) {
        return undefined;
      }
      const key =
        property.key.type === "Identifier"
          ? property.key.name
          : property.key.value;
      link[key] = property.value.value;
    }
    if (typeof link.title !== "string" || typeof link.href !== "string") {
      return undefined;
    }
    links.push(link);
  }
  return links;
}

async function quickLinks(node, ctx) {
  const items = [];
  for (const child of node.children ?? []) {
    if (isJsx(child) && child.name === "QuickLink") {
      items.push(await quickLinkItem(child, ctx));
    }
  }
  // The site prefers explicit children to the links prop.
  if (items.length === 0) {
    const attribute = node.attributes?.find(
      (attribute) =>
        attribute.type === "mdxJsxAttribute" && attribute.name === "links",
    );
    if (attribute) {
      const links = literalQuickLinks(attribute);
      if (!links) {
        ctx.error(
          node,
          "QuickLinks links must be an array of literal objects with string title, href and optional description/action fields.",
        );
        return [];
      }
      for (const { title, href, description } of links) {
        items.push(
          quickLinkItemNodes(
            {
              title,
              href,
              description: description ? [u.text(description)] : [],
            },
            ctx,
            node,
          ),
        );
      }
    }
  }
  return items.length > 0 ? [u.list(items)] : [];
}

async function disclosure(node, ctx) {
  const attrs = attributes(node);
  const summary = attributeString(attrs, "summary");
  const id = attributeString(attrs, "id");
  const children = asFlow(await transformChildren(node, ctx));
  // Keep the id that site links point to, as an HTML anchor.
  const anchor = id ? [{ type: "html", value: `<a id="${id}"></a>` }] : [];
  return summary
    ? [...anchor, u.paragraph([u.strong([u.text(summary)])]), ...children]
    : [...anchor, ...children];
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

/** A cell's `colSpan`/`rowSpan` (or lowercase) as a count, defaulting to 1. */
function cellSpan(attrs, name) {
  const value =
    attributeString(attrs, name) ??
    attrs[name]?.expression ??
    attributeString(attrs, name.toLowerCase()) ??
    attrs[name.toLowerCase()]?.expression;
  const span = Number.parseInt(value, 10);
  return Number.isInteger(span) && span > 1 ? span : 1;
}

/**
 * Converts a JSX table. Markdown has no merged cells, so a cell that spans
 * columns or rows is repeated in each of them, which keeps every column's
 * header above it.
 */
async function tableElement(node, ctx) {
  const rows = [];
  // Cells continuing down from rows above, by column: { cell, rows }.
  const spanning = [];
  async function collectCells(row) {
    const cells = [];
    const fillSpanned = () => {
      while (spanning[cells.length]?.rows > 0) {
        const below = spanning[cells.length];
        below.rows -= 1;
        cells.push(below.cell);
      }
    };
    async function visit(parent) {
      for (const child of parent.children ?? []) {
        if (isJsx(child) && CELL_PATTERN.test(child.name)) {
          const attrs = attributes(child);
          const cell = collapseWhitespace(
            asPhrasing(await transformChildren(child, ctx)),
          );
          const rowSpan = cellSpan(attrs, "rowSpan");
          for (let column = 0; column < cellSpan(attrs, "colSpan"); column++) {
            fillSpanned();
            if (rowSpan > 1) {
              spanning[cells.length] = { cell, rows: rowSpan - 1 };
            }
            cells.push(cell);
          }
        } else if (child.children) {
          await visit(child);
        }
      }
    }
    await visit(row);
    fillSpanned();
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
  const url = href ? ctx.links.resolve(href, ctx, node) : null;
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
  const heading = u.heading(
    depth,
    asPhrasing(await transformChildren(node, ctx)),
  );
  // The site doesn't give headings written as JSX an anchor.
  heading.data = { jsx: true };
  return [heading];
}

const HANDLERS = {
  AGThemeProvider: unwrap,
  AgEnterpriseFeature: agEnterpriseFeature,
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
  Diagram: diagram,
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
