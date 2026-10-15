import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { agentsBlock, indexLines, MANIFEST_FILE } from "./agents-md.mjs";
import { markdownAnchors } from "./anchors.mjs";
import {
  DOCS_DIRECTORY,
  GENERATED_MARKER,
  MAX_AGENTS_BLOCK_BYTES,
  MAX_PAGE_BYTES,
  MAX_PAGE_LINES,
  SITE_ORIGIN,
} from "./config.mjs";
import { createExampleResolver, unshownPatternExamples } from "./examples.mjs";
import { compareText, pathExists } from "./files.mjs";
import { createLinkResolver, docLink } from "./links.mjs";
import { parseMarkdown } from "./mdx.mjs";
import { discoverDocuments } from "./pages.mjs";
import { createPropsProvider } from "./props.mjs";
import {
  collectCountrySymbols,
  collectIcons,
  collectTokens,
  renderCountrySymbolReference,
  renderIconReference,
  renderTokenReference,
  TOKEN_REFERENCE_PATH,
} from "./references.mjs";
import {
  renderComponentDocument,
  renderIndex,
  renderManifest,
  renderPageDocument,
} from "./render.mjs";

export const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

// Consumers run this script from the installed package to set up AGENTS.md.
const AGENTS_MD_PACKAGE = "@salt-ds/core";
const AGENTS_MD_SCRIPT = "agents-md.mjs";
const AGENTS_MD_SOURCE = fileURLToPath(
  new URL("./agents-md.mjs", import.meta.url),
);

export class AgentDocsError extends Error {
  constructor(errors) {
    super(
      `Agent docs generation failed with ${errors.length} error(s):\n${errors
        .map((error) => `- ${error}`)
        .join("\n")}`,
    );
    this.name = "AgentDocsError";
    this.errors = errors;
  }
}

async function readPackages(packagesDir) {
  const packages = new Map();
  const entries = await readdir(packagesDir, { withFileTypes: true });
  for (const entry of entries.sort((left, right) =>
    compareText(left.name, right.name),
  )) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(packagesDir, entry.name, "package.json");
    if (!(await pathExists(manifestPath))) continue;
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    packages.set(manifest.name, {
      directory: entry.name,
      version: manifest.version,
      files: manifest.files ?? [],
    });
  }
  return packages;
}

function createOutputs() {
  const outputs = new Map();
  return {
    outputs,
    get(packageName) {
      if (!outputs.has(packageName)) {
        outputs.set(packageName, { files: new Map(), entries: [] });
      }
      return outputs.get(packageName);
    },
  };
}

function linkToRoute(routeIndex, from, route) {
  const target = routeIndex.get(route);
  if (!target) return `${SITE_ORIGIN}${route}`;
  return docLink({
    fromPackage: from.packageName,
    fromDocPath: from.docPath,
    toPackage: target.packageName,
    toDocPath: target.docPath,
  });
}

async function addReferences({ packages, packagesDir, routeIndex, outputs }) {
  const theme = packages.get("@salt-ds/theme");
  if (theme) {
    const from = {
      packageName: "@salt-ds/theme",
      docPath: TOKEN_REFERENCE_PATH,
    };
    const tokens = await collectTokens(
      path.join(packagesDir, theme.directory, "src", "css"),
    );
    const target = outputs.get(from.packageName);
    const files = renderTokenReference({
      tokens,
      packageVersion: theme.version,
      links: {
        designTokens: linkToRoute(
          routeIndex,
          from,
          "/salt/themes/design-tokens",
        ),
        howToRead: linkToRoute(
          routeIndex,
          from,
          "/salt/themes/design-tokens/how-to-read-tokens",
        ),
      },
    });
    for (const { docPath, markdown } of files) {
      target.files.set(docPath, markdown);
    }
    target.entries.push({
      section: "reference",
      title: "Design tokens reference",
      docPath: from.docPath,
      summary: `All ${tokens.length} design token names by tier, including deprecated tokens.`,
    });
  }

  const icons = packages.get("@salt-ds/icons");
  if (icons) {
    const from = { packageName: "@salt-ds/icons", docPath: "icons.md" };
    const iconList = await collectIcons(
      path.join(packagesDir, icons.directory),
    );
    const target = outputs.get(from.packageName);
    target.files.set(
      from.docPath,
      renderIconReference({
        icons: iconList,
        packageVersion: icons.version,
        links: { icon: linkToRoute(routeIndex, from, "/salt/components/icon") },
      }),
    );
    target.entries.push({
      section: "reference",
      title: "Icon list",
      docPath: from.docPath,
      summary: `Names of all ${iconList.length} icon components, with deprecations.`,
    });
  }

  const countries = packages.get("@salt-ds/countries");
  if (countries) {
    const from = {
      packageName: "@salt-ds/countries",
      docPath: "country-symbols.md",
    };
    const symbols = await collectCountrySymbols(
      path.join(packagesDir, countries.directory),
    );
    const target = outputs.get(from.packageName);
    target.files.set(
      from.docPath,
      renderCountrySymbolReference({
        symbols,
        packageVersion: countries.version,
        links: {
          countrySymbol: linkToRoute(
            routeIndex,
            from,
            "/salt/components/country-symbol",
          ),
        },
      }),
    );
    target.entries.push({
      section: "reference",
      title: "Country symbol list",
      docPath: from.docPath,
      summary: "ISO 3166-1 alpha-2 codes of all country symbol components.",
    });
  }
}

async function containsFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) return true;
    if (await containsFiles(path.join(directory, entry.name))) return true;
  }
  return false;
}

/**
 * A docs folder can be replaced when its index carries the generated marker or
 * it holds no files at all, as an interrupted removal can leave it.
 */
async function canReplaceDocs(docsDir) {
  if (!(await pathExists(docsDir))) return true;
  const indexPath = path.join(docsDir, "index.md");
  if (
    (await pathExists(indexPath)) &&
    (await readFile(indexPath, "utf8")).split("\n", 1)[0] === GENERATED_MARKER
  ) {
    return true;
  }
  return !(await containsFiles(docsDir));
}

async function removeGeneratedDocs(docsDir) {
  if (!(await pathExists(docsDir))) return;
  // Remove the index, which carries the marker, last so an interrupted run
  // leaves a folder that the next run can still replace.
  for (const entry of await readdir(docsDir)) {
    if (entry !== "index.md") {
      await rm(path.join(docsDir, entry), { recursive: true, force: true });
    }
  }
  await rm(docsDir, { recursive: true, force: true });
}

async function writeOutputs({ packages, packagesDir, outputs, repoRoot }) {
  const docsDirs = [...packages].map(([packageName, info]) => ({
    packageName,
    docsDir: path.join(packagesDir, info.directory, DOCS_DIRECTORY),
  }));
  const foreign = [];
  for (const { docsDir } of docsDirs) {
    if (!(await canReplaceDocs(docsDir))) {
      foreign.push(
        `Refusing to replace ${path.relative(repoRoot, docsDir)}: it was not generated by tooling/agent-docs, because its index.md has no generated marker. Move or delete it, then run again.`,
      );
    }
  }
  if (foreign.length > 0) throw new AgentDocsError(foreign);

  for (const { packageName, docsDir } of docsDirs) {
    await removeGeneratedDocs(docsDir);
    const target = outputs.get(packageName);
    if (!target) continue;
    // Write the index first so an interrupted run still carries the marker.
    const files = [...target.files].sort(([left], [right]) =>
      left === "index.md" ? -1 : right === "index.md" ? 1 : 0,
    );
    for (const [docPath, content] of files) {
      const filePath = path.join(docsDir, ...docPath.split("/"));
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    }
  }
}

const DEFERRED_ANCHOR_PATTERN = /#salt-anchor-(\d+)/g;

/**
 * Replaces the placeholder anchors that links got while pages were converted
 * with the anchor each heading has in its generated document, which can
 * differ from the site's when a document merges a component's tabs.
 */
function resolveDeferredAnchors(outputs, deferred, anchorMaps) {
  for (const { files } of outputs.values()) {
    for (const [docPath, content] of files) {
      if (!docPath.endsWith(".md") || !content.includes("#salt-anchor-")) {
        continue;
      }
      files.set(
        docPath,
        content.replace(DEFERRED_ANCHOR_PATTERN, (_match, index) => {
          const { route, anchor } = deferred[Number(index)];
          return `#${anchorMaps.get(route)?.get(anchor) ?? anchor}`;
        }),
      );
    }
  }
}

/**
 * Every generated link to another generated file must resolve, including
 * the heading it points to. Links are read from the parsed Markdown, so code
 * is never mistaken for a link.
 */
export function findBrokenLinks(outputs) {
  const parsed = new Map();
  const markdown = (packageName, docPath) => {
    const key = `${packageName}/${docPath}`;
    if (!parsed.has(key)) {
      const content = outputs.get(packageName)?.files.get(docPath) ?? "";
      parsed.set(key, { tree: parseMarkdown(content) });
    }
    return parsed.get(key);
  };
  const broken = [];
  for (const [packageName, { files }] of outputs) {
    for (const docPath of files.keys()) {
      if (!docPath.endsWith(".md")) continue;
      const targets = [];
      const visit = (node) => {
        if (node.type === "link" || node.type === "definition") {
          targets.push(node.url);
        }
        for (const child of node.children ?? []) visit(child);
      };
      visit(markdown(packageName, docPath).tree);
      for (const target of targets) {
        if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
        const hashIndex = target.indexOf("#");
        const url = hashIndex === -1 ? target : target.slice(0, hashIndex);
        const anchor = hashIndex === -1 ? "" : target.slice(hashIndex + 1);
        let targetPackage = packageName;
        let targetPath = docPath;
        const crossPackage = /^(@salt-ds\/[a-z0-9-]+)\/docs\/(.+)$/.exec(url);
        if (crossPackage) {
          [, targetPackage, targetPath] = crossPackage;
        } else if (url) {
          targetPath = path.posix.normalize(
            path.posix.join(path.posix.dirname(docPath), url),
          );
        }
        if (!outputs.get(targetPackage)?.files.has(targetPath)) {
          broken.push(`${packageName}/docs/${docPath}: broken link ${target}.`);
          continue;
        }
        if (!anchor || !targetPath.endsWith(".md")) continue;
        const destination = markdown(targetPackage, targetPath);
        destination.anchors ??= markdownAnchors(destination.tree);
        if (!destination.anchors.has(decodeURIComponent(anchor))) {
          broken.push(
            `${packageName}/docs/${docPath}: link ${target} points to a heading that doesn't exist.`,
          );
        }
      }
    }
  }
  return broken;
}

const nameKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Agents read `alsoKnownAs` names as other names for the same component, so
 * this leaves out names that are another page's title, which agents would
 * mistake for that page, and repeated spellings. Returns authoring notes.
 */
export function dropMisleadingAliases(documents) {
  const titles = new Map();
  for (const doc of documents) {
    const key = nameKey(doc.title);
    if (!titles.has(key)) titles.set(key, []);
    titles.get(key).push(doc);
  }
  const notes = [];
  for (const doc of documents) {
    const seen = new Set();
    doc.aliases = doc.aliases.filter((alias) => {
      const key = nameKey(alias);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      const other = titles.get(key)?.find((page) => page !== doc);
      if (!other) return true;
      notes.push(
        `site/docs/${(doc.index ?? doc.page).relativePath}: alsoKnownAs "${alias}" is the title of ${other.packageName}/docs/${other.docPath}, so the docs for agents leave it out.`,
      );
      return false;
    });
  }
  return notes;
}

/**
 * Generates `packages/<name>/docs` for every package that owns site pages.
 * Throws `AgentDocsError` listing every problem; nothing is written then.
 */
export async function generateAgentDocs({
  repoRoot = REPOSITORY_ROOT,
  write = true,
  propsProvider,
} = {}) {
  const siteDocsDir = path.join(repoRoot, "site", "docs");
  const packagesDir = path.join(repoRoot, "packages");
  const packages = await readPackages(packagesDir);
  const { documents, errors } = await discoverDocuments({ siteDocsDir });
  const warnings = [];
  // Authoring suggestions: gaps that make the docs less useful to agents.
  const notes = [];

  for (const doc of documents) {
    if (!packages.has(doc.packageName)) {
      errors.push(`${doc.route}: unknown package ${doc.packageName}.`);
    }
    if (doc.kind === "component" && doc.aliases.length === 0) {
      notes.push(
        `site/docs/${doc.index.relativePath}: no alsoKnownAs names, so the docs index lists only its title.`,
      );
    }
  }
  const knownDocuments = documents.filter((doc) =>
    packages.has(doc.packageName),
  );
  notes.push(...dropMisleadingAliases(knownDocuments));
  const routeIndex = new Map(
    knownDocuments.map((doc) => [
      doc.route,
      { packageName: doc.packageName, docPath: doc.docPath },
    ]),
  );
  const examplesDir = path.join(repoRoot, "site", "src", "examples");
  // Anchors in links are resolved once every document's headings are known.
  const deferredAnchors = [];
  const anchorMaps = new Map();
  const deferAnchor = (route, anchor) => {
    deferredAnchors.push({ route, anchor });
    return `#salt-anchor-${deferredAnchors.length - 1}`;
  };
  const shared = {
    packages,
    links: createLinkResolver(routeIndex, { deferAnchor }),
    examples: createExampleResolver({ examplesDir }),
    props: propsProvider ?? createPropsProvider({ packagesDir }),
    documents: knownDocuments,
    componentsByTitle: new Map(
      knownDocuments
        .filter((doc) => doc.kind === "component")
        .map((doc) => [doc.title.toLowerCase(), doc]),
    ),
    patternsByTitle: new Map(
      knownDocuments
        .filter((doc) => doc.route.startsWith("/salt/patterns/"))
        .map((doc) => [doc.title.toLowerCase(), doc]),
    ),
    errors,
    warnings,
    notes,
  };

  const outputs = createOutputs();
  for (const doc of knownDocuments) {
    const rendered =
      doc.kind === "component"
        ? await renderComponentDocument(doc, shared)
        : await renderPageDocument(doc, shared);
    for (const [route, anchors] of rendered.anchorMap) {
      anchorMaps.set(route, anchors);
    }
    const target = outputs.get(doc.packageName);
    for (const file of [
      { docPath: doc.docPath, markdown: rendered.markdown },
      ...rendered.files,
    ]) {
      if (target.files.has(file.docPath)) {
        errors.push(`${doc.route}: more than one page writes ${file.docPath}.`);
      }
      target.files.set(file.docPath, file.markdown);
    }
    const pageBytes = Buffer.byteLength(rendered.markdown);
    const pageLines = rendered.markdown.trimEnd().split("\n").length;
    // A component page merges its tab pages, so name the folder holding them.
    const source =
      doc.kind === "component"
        ? `${path.posix.dirname(doc.index.relativePath)}/`
        : doc.page.relativePath;
    if (pageBytes > MAX_PAGE_BYTES) {
      warnings.push(
        `${doc.packageName}/docs/${doc.docPath} is ${Math.round(pageBytes / 1024)} KB with its examples moved out, so agents may not read it in one go. Consider shortening site/docs/${source}.`,
      );
    } else if (pageLines > MAX_PAGE_LINES) {
      notes.push(
        `${doc.packageName}/docs/${doc.docPath} is ${pageLines} lines, and agents often stop reading after about ${MAX_PAGE_LINES}, so its later sections may go unread. Consider shortening site/docs/${source}.`,
      );
    }
    target.entries.push({
      title: doc.title,
      docPath: doc.docPath,
      summary: rendered.summary,
      aliases: doc.aliases,
    });
  }
  for (const example of await unshownPatternExamples({
    examplesDir,
    shown: shared.examples.shown,
  })) {
    errors.push(
      `site/src/examples/${example}.tsx: no pattern page shows this example. Add a LivePreview for it to the section of the page that discusses it.`,
    );
  }
  await addReferences({ packages, packagesDir, routeIndex, outputs });
  if (packages.has(AGENTS_MD_PACKAGE)) {
    outputs
      .get(AGENTS_MD_PACKAGE)
      .files.set(AGENTS_MD_SCRIPT, await readFile(AGENTS_MD_SOURCE, "utf8"));
  }

  const packageNames = [...outputs.outputs.keys()].sort();
  const manifests = [];
  for (const packageName of packageNames) {
    const info = packages.get(packageName);
    const target = outputs.outputs.get(packageName);
    const index = renderIndex({
      packageName,
      version: info.version,
      entries: target.entries,
      otherPackages: packageNames.filter((name) => name !== packageName),
    });
    target.files.set("index.md", index);
    if (Buffer.byteLength(index) > MAX_PAGE_BYTES) {
      warnings.push(
        `${packageName}/docs/index.md is ${Math.round(Buffer.byteLength(index) / 1024)} KB. Agents read it first, so keep it under ${MAX_PAGE_BYTES / 1024} KB.`,
      );
    }
    const manifest = renderManifest({
      packageName,
      version: info.version,
      entries: target.entries,
    });
    target.files.set(MANIFEST_FILE, manifest);
    manifests.push({
      directory: packageName.replace(/^@salt-ds\//, ""),
      pages: JSON.parse(manifest).pages,
    });
    if (!info.files.some((entry) => /^(?:\.?\/)?docs\/?$/.test(entry))) {
      errors.push(
        `${packageName}: add "${DOCS_DIRECTORY}" to "files" in packages/${info.directory}/package.json so its generated docs are published.`,
      );
    }
  }
  // The block agents-md.mjs writes when every package is installed.
  const agentsBlockBytes = Buffer.byteLength(
    agentsBlock({
      root: "node_modules/@salt-ds",
      lines: indexLines(manifests),
    }),
  );
  if (agentsBlockBytes > MAX_AGENTS_BLOCK_BYTES) {
    warnings.push(
      `The AGENTS.md block indexing every package is ${Math.round(agentsBlockBytes / 1024)} KB. Agents receive it with every request, so keep it under ${MAX_AGENTS_BLOCK_BYTES / 1024} KB.`,
    );
  }

  resolveDeferredAnchors(outputs.outputs, deferredAnchors, anchorMaps);
  errors.push(...findBrokenLinks(outputs.outputs));
  if (errors.length > 0) throw new AgentDocsError(errors);
  if (write) {
    await writeOutputs({
      packages,
      packagesDir,
      outputs: outputs.outputs,
      repoRoot,
    });
  }

  const summary = new Map(
    packageNames.map((packageName) => {
      const files = outputs.outputs.get(packageName).files;
      let bytes = 0;
      for (const content of files.values()) bytes += Buffer.byteLength(content);
      return [packageName, { files: files.size, bytes }];
    }),
  );
  return {
    packages: summary,
    outputs: outputs.outputs,
    agentsBlockBytes,
    warnings,
    notes,
  };
}
