import path from "node:path";
import GithubSlugger from "github-slugger";
import { MAX_PAGE_BYTES, MAX_PAGE_LINES } from "./config.mjs";
import { relativeDocLink } from "./links.mjs";
import { EXAMPLE_NODE, PROPS_NODE, stringifyMarkdown, u } from "./mdx.mjs";

function slugify(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function exampleLabel(example) {
  return [
    u.emphasis([u.text("Example:")]),
    u.text(" "),
    u.inlineCode(example.name),
  ];
}

/**
 * A supporting file's Markdown. `linkShared` returns a link for files kept
 * in a shared file, or undefined to show the file here.
 */
function supportNodes(file, shown, linkShared) {
  const label = [u.text("Supporting file "), u.inlineCode(file.displayPath)];
  if (file.kind === "file") {
    const sharedLink = linkShared?.(file);
    if (sharedLink) {
      return [
        u.paragraph([
          ...label,
          u.text(" is in "),
          u.link(sharedLink, [u.text(file.examplePath)]),
          u.text("."),
        ]),
      ];
    }
    if (shown.has(file.absolutePath)) {
      return [u.paragraph([...label, u.text(" is shown above.")])];
    }
    shown.add(file.absolutePath);
    return [
      u.paragraph([...label, u.text(":")]),
      u.code(file.language, file.code.trimEnd()),
    ];
  }
  const kind = file.kind === "asset" ? "Asset " : "Site helper ";
  return [
    u.paragraph([
      u.text(kind),
      u.inlineCode(file.displayPath),
      u.text(" (not included)."),
    ]),
  ];
}

/** An example's source; `shown` holds the files already shown nearby. */
function exampleNodes(example, shown, linkShared, { label = true } = {}) {
  const { entry, support } = example;
  const exampleText = exampleLabel(example);
  if (shown.has(entry.absolutePath)) {
    return [u.paragraph([...exampleText, u.text(" (shown above).")])];
  }
  shown.add(entry.absolutePath);
  return [
    ...(label ? [u.paragraph(exampleText)] : []),
    u.code(entry.language, entry.code.trimEnd()),
    ...support.flatMap((file) => supportNodes(file, shown, linkShared)),
  ];
}

function collectNodes(nodes, type, found = []) {
  for (const node of nodes) {
    if (node.type === type) found.push(node);
    else if (node.children) collectNodes(node.children, type, found);
  }
  return found;
}

/** `nodes` with their relative links rewritten for a file at `toDocPath`. */
function rebaseLinks(nodes, fromDocPath, toDocPath) {
  return nodes.map((node) => {
    const copy = node.children
      ? {
          ...node,
          children: rebaseLinks(node.children, fromDocPath, toDocPath),
        }
      : node;
    // Leave URLs, root-relative paths and package-qualified links to other
    // packages' docs, which don't depend on the file's folder.
    if (
      node.type !== "link" ||
      /^(?:[a-z][a-z0-9+.-]*:|@|\/)/i.test(node.url)
    ) {
      return copy;
    }
    const hashAt = node.url.indexOf("#");
    const target = hashAt === -1 ? node.url : node.url.slice(0, hashAt);
    const hash = hashAt === -1 ? "" : node.url.slice(hashAt);
    const resolved = target
      ? path.posix.join(path.posix.dirname(fromDocPath), target)
      : fromDocPath;
    return { ...copy, url: `${relativeDocLink(toDocPath, resolved)}${hash}` };
  });
}

function measure(nodes) {
  const markdown = stringifyMarkdown({ type: "root", children: nodes });
  return {
    bytes: Buffer.byteLength(markdown),
    lines: markdown.trimEnd().split("\n").length,
  };
}

function uniquePath(paths, candidate) {
  let docPath = candidate;
  for (let count = 2; paths.has(docPath); count += 1) {
    docPath = candidate.replace(/\.md$/, `-${count}.md`);
  }
  paths.add(docPath);
  return docPath;
}

/** Groups the repeats of one example on a page, which move together. */
function groupExamples(examples, base) {
  const groups = new Map();
  const paths = new Set();
  for (const example of examples) {
    const key = example.entry.absolutePath;
    if (!groups.has(key)) {
      groups.set(key, {
        examples: [],
        docPath: uniquePath(
          paths,
          `${base}/examples/${slugify(example.name) || "example"}.md`,
        ),
      });
    }
    const group = groups.get(key);
    group.examples.push(example);
    example.group = group;
  }
  return [...groups.values()];
}

/**
 * Renders the LivePreview examples and props tables on a page. When the page
 * would exceed `budget` bytes or `lineBudget` lines, it links its examples'
 * supporting files instead of showing them, then moves the largest examples
 * to files under `<page>/examples/`, linked from the page, until it fits. With
 * `keepShortFirst`, a first example of up to half of `lineBudget` stays unless
 * the page is still over `budget` without the others. Large supporting files,
 * and those that more than one moved example uses, are always written once
 * under `<page>/examples/files/` and linked. When the page would exceed
 * `budget` even with every example moved, its props tables move to
 * `<page>/props.md`, leaving the headings and guidance around them.
 */
export function placeExamples(
  children,
  {
    title,
    docPath,
    budget = MAX_PAGE_BYTES,
    lineBudget = MAX_PAGE_LINES,
    keepShortFirst = true,
  },
) {
  const examples = collectNodes(children, EXAMPLE_NODE);
  const base = docPath.replace(/\.md$/, "");
  const groups = groupExamples(examples, base);
  const moved = new Set();

  const propsNodes = collectNodes(children, PROPS_NODE);
  const propsDocPath = `${base}/props.md`;
  const propsTitle = `${title} props`;
  // The props file has a heading for each table, under its title.
  const propsSlugger = new GithubSlugger();
  propsSlugger.slug(propsTitle);
  const propsAnchors = new Map(
    propsNodes.map((node) => [node, propsSlugger.slug(node.names[0])]),
  );
  let moveProps = false;
  const propsLink = (node) =>
    u.paragraph([
      u.emphasis([u.text("Props:")]),
      u.text(" "),
      ...node.names.flatMap((name, index) => [
        ...(index === 0 ? [] : [u.text(", ")]),
        u.inlineCode(name),
      ]),
      u.text(" ("),
      u.link(
        `${relativeDocLink(docPath, propsDocPath)}#${propsAnchors.get(node)}`,
        [u.text(node.names.length > 1 ? "tables" : "table")],
      ),
      u.text(")."),
    ]);

  // Supporting files written once under `<page>/examples/files/` and linked.
  const sharedFiles = new Map();
  const sharedPaths = new Set();
  // Whether the page links its examples' supporting files instead of showing them.
  let linkSupport = false;
  const fileLink = (fromDocPath, file) => {
    if (!sharedFiles.has(file.absolutePath)) {
      sharedFiles.set(file.absolutePath, {
        file,
        docPath: uniquePath(
          sharedPaths,
          `${base}/examples/files/${slugify(file.examplePath)}.md`,
        ),
      });
    }
    return relativeDocLink(
      fromDocPath,
      sharedFiles.get(file.absolutePath).docPath,
    );
  };

  const render = () => {
    // Only the supporting files this rendering links are written.
    sharedFiles.clear();
    sharedPaths.clear();
    const shown = new Set();
    const linkFile = (file) =>
      file.large || linkSupport ? fileLink(docPath, file) : undefined;
    const replace = (nodes) =>
      nodes.flatMap((node) => {
        if (node.type === EXAMPLE_NODE) {
          if (!moved.has(node.group)) {
            return exampleNodes(node, shown, linkFile);
          }
          return [
            u.paragraph([
              ...exampleLabel(node),
              u.text(" ("),
              u.link(relativeDocLink(docPath, node.group.docPath), [
                u.text("source"),
              ]),
              u.text(")."),
            ]),
          ];
        }
        if (node.type === PROPS_NODE) {
          return moveProps ? [propsLink(node)] : replace(node.children);
        }
        return node.children
          ? [{ ...node, children: replace(node.children) }]
          : [node];
      });
    return replace(children);
  };

  const withinBytes = (nodes) => measure(nodes).bytes <= budget;
  const fits = (nodes) => {
    const size = measure(nodes);
    return size.bytes <= budget && size.lines <= lineBudget;
  };

  if (propsNodes.length > 0 && !withinBytes(render())) {
    // Props tables move only when moving every example leaves the page too
    // large to read in one call.
    linkSupport = true;
    for (const group of groups) moved.add(group);
    moveProps = !withinBytes(render());
    linkSupport = false;
    moved.clear();
  }

  let placed = render();
  if (groups.length > 0 && !fits(placed)) {
    // Supporting files, such as styles and data, are linked rather than shown.
    linkSupport = true;
    placed = render();
  }
  if (groups.length > 0 && !fits(placed)) {
    const sizes = new Map(
      groups.map((group) => [
        group,
        measure(exampleNodes(group.examples[0], new Set(), () => "#")),
      ]),
    );
    // A short first example, usually the basic composition, can stay on the
    // page unless the page is too large to read in one call. A long one
    // moves like the others.
    const [firstGroup, ...otherGroups] = groups;
    const keepFirst =
      keepShortFirst && sizes.get(firstGroup).lines <= lineBudget / 2;
    // Largest first, measured against whichever budget it uses more of.
    const candidates = (keepFirst ? otherGroups : groups)
      .map((group) => {
        const size = sizes.get(group);
        return {
          group,
          share: Math.max(size.bytes / budget, size.lines / lineBudget),
        };
      })
      .sort((left, right) => right.share - left.share)
      .map(({ group }) => group);
    // Move the fewest of the largest examples that make the page fit. Each
    // one moved shortens the page, so search for that number rather than
    // rendering the whole page again after each move.
    const moving = (count) => {
      moved.clear();
      for (const group of candidates.slice(0, count)) moved.add(group);
      return render();
    };
    let tooFew = 0;
    let enough = candidates.length;
    if (fits(moving(enough))) {
      while (enough - tooFew > 1) {
        const middle = Math.floor((tooFew + enough) / 2);
        if (fits(moving(middle))) enough = middle;
        else tooFew = middle;
      }
    }
    placed = moving(enough);
    if (keepFirst && !withinBytes(placed)) {
      moved.add(firstGroup);
      placed = render();
    }
  }

  const movedGroups = groups.filter((group) => moved.has(group));
  const groupsUsing = new Map();
  for (const group of groups) {
    for (const file of group.examples[0].support) {
      if (file.kind !== "file") continue;
      groupsUsing.set(
        file.absolutePath,
        (groupsUsing.get(file.absolutePath) ?? 0) + 1,
      );
    }
  }
  const backLink = (fromDocPath) =>
    u.link(relativeDocLink(fromDocPath, docPath), [u.text(title)]);

  const files = movedGroups.map((group) => {
    const [first] = group.examples;
    const heading = `${title} example: ${first.name}`;
    // Large files, files shared with other examples and then the largest
    // files if the example is still too long are linked rather than shown.
    const linked = new Set(
      first.support
        .filter(
          (file) => file.large || (groupsUsing.get(file.absolutePath) ?? 0) > 1,
        )
        .map((file) => file.absolutePath),
    );
    const render = () =>
      stringifyMarkdown({
        type: "root",
        children: [
          u.heading(1, [u.text(heading)]),
          u.paragraph([
            u.text("Source of the "),
            u.inlineCode(first.name),
            u.text(" example on the "),
            backLink(group.docPath),
            u.text(" page."),
          ]),
          ...exampleNodes(
            first,
            new Set(),
            (file) =>
              linked.has(file.absolutePath)
                ? fileLink(group.docPath, file)
                : undefined,
            { label: false },
          ),
        ],
      });
    let markdown = render();
    const largestFiles = first.support
      .filter((file) => file.kind === "file" && !linked.has(file.absolutePath))
      .sort((left, right) => right.code.length - left.code.length);
    for (const file of largestFiles) {
      if (Buffer.byteLength(markdown) <= budget) break;
      linked.add(file.absolutePath);
      markdown = render();
    }
    return { docPath: group.docPath, markdown };
  });
  if (moveProps) {
    files.push({
      docPath: propsDocPath,
      // Generation warns when the props file itself is too large.
      props: true,
      markdown: stringifyMarkdown({
        type: "root",
        children: [
          u.heading(1, [u.text(propsTitle)]),
          u.paragraph([
            u.text("Props tables for the "),
            backLink(propsDocPath),
            u.text(" page."),
          ]),
          ...propsNodes.flatMap((node) => [
            u.heading(2, [u.inlineCode(node.names[0])]),
            ...rebaseLinks(node.children, docPath, propsDocPath),
          ]),
        ],
      }),
    });
  }
  for (const { file, docPath: sharedPath } of sharedFiles.values()) {
    files.push({
      docPath: sharedPath,
      markdown: stringifyMarkdown({
        type: "root",
        children: [
          u.heading(1, [u.text(`${title} example file: ${file.examplePath}`)]),
          u.paragraph([
            u.text("Supporting file for examples on the "),
            backLink(sharedPath),
            u.text(" page."),
          ]),
          u.code(file.language, file.code.trimEnd()),
        ],
      }),
    });
  }
  return { children: placed, files };
}
