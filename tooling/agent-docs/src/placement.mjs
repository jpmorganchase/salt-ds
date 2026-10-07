import path from "node:path";
import { MAX_PAGE_BYTES, MAX_PAGE_LINES } from "./config.mjs";
import { relativeDocLink } from "./links.mjs";
import { EXAMPLE_NODE, stringifyMarkdown, u } from "./mdx.mjs";

function slugify(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function exampleLabel(example) {
  const label = [
    u.emphasis([u.text("Example:")]),
    u.text(" "),
    u.inlineCode(example.name),
  ];
  if (example.entry.isModule) {
    label.push(
      u.text(", exported by "),
      u.inlineCode(example.entry.displayPath),
    );
  }
  return label;
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
    ...(label
      ? [
          u.paragraph(
            entry.isModule ? [...exampleText, u.text(":")] : exampleText,
          ),
        ]
      : []),
    u.code(entry.language, entry.code.trimEnd()),
    ...support.flatMap((file) => supportNodes(file, shown, linkShared)),
  ];
}

function collectExamples(nodes, examples = []) {
  for (const node of nodes) {
    if (node.type === EXAMPLE_NODE) examples.push(node);
    else if (node.children) collectExamples(node.children, examples);
  }
  return examples;
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

/**
 * Groups examples that move together: the examples a page shows from one
 * file, which is each repeat of one example or every example exported by the
 * same module, since they share its source.
 */
function groupExamples(examples, base) {
  const groups = new Map();
  const paths = new Set();
  for (const example of examples) {
    const key = example.entry.absolutePath;
    if (!groups.has(key)) {
      const name = example.entry.isModule
        ? path.posix.basename(path.posix.dirname(example.entry.displayPath))
        : example.name;
      groups.set(key, {
        examples: [],
        docPath: uniquePath(
          paths,
          `${base}/examples/${slugify(name) || "example"}.md`,
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
 * Renders the LivePreview examples on a page. When the page would exceed
 * `budget` bytes or `lineBudget` lines, it links its examples' supporting
 * files instead of showing them, then moves the largest examples to files
 * under `<page>/examples/`, linked from the page, until it fits. A first
 * example of up to half of `lineBudget` stays unless the page is still over
 * `budget` without the others. Large supporting files, and those that more
 * than one moved example uses, are always written once under
 * `<page>/examples/files/` and linked.
 */
export function placeExamples(
  children,
  { title, docPath, budget = MAX_PAGE_BYTES, lineBudget = MAX_PAGE_LINES },
) {
  const examples = collectExamples(children);
  const base = docPath.replace(/\.md$/, "");
  const groups = groupExamples(examples, base);
  const moved = new Set();

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

  let placed = render();
  if (groups.length > 0 && !fits(placed)) {
    // Supporting files, such as styles and data, are linked rather than shown.
    linkSupport = true;
    placed = render();
  }
  if (groups.length > 0 && !fits(placed)) {
    const sizeOf = (group) =>
      measure(exampleNodes(group.examples[0], new Set(), () => "#"));
    // The first example usually shows the basic composition, so a short one
    // stays on the page unless the page is too large to read in one call.
    // A long one, such as a pattern module holding every example, moves like
    // the others.
    const [firstGroup, ...otherGroups] = groups;
    const keepFirst = sizeOf(firstGroup).lines <= lineBudget / 2;
    // Largest first, measured against whichever budget it uses more of.
    const candidates = (keepFirst ? otherGroups : groups)
      .map((group) => {
        const size = sizeOf(group);
        return {
          group,
          share: Math.max(size.bytes / budget, size.lines / lineBudget),
        };
      })
      .sort((left, right) => right.share - left.share)
      .map(({ group }) => group);
    for (const group of candidates) {
      moved.add(group);
      placed = render();
      if (fits(placed)) break;
    }
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
  const nameList = (names) =>
    names.flatMap((name, index) => [
      ...(index > 0
        ? [u.text(index === names.length - 1 ? " and " : ", ")]
        : []),
      u.inlineCode(name),
    ]);

  const files = movedGroups.map((group) => {
    const [first] = group.examples;
    const heading = first.entry.isModule
      ? `${title} examples: ${first.entry.displayPath}`
      : `${title} example: ${first.name}`;
    const names = [...new Set(group.examples.map((example) => example.name))];
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
            ...nameList(names),
            u.text(names.length > 1 ? " examples on the " : " example on the "),
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
