import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const examplesRoot = path.join(repositoryRoot, "site", "src", "examples");
const manifestPath = path.join(examplesRoot, "patterns", "manifest.json");
const sourceLoadersPath = path.join(
  repositoryRoot,
  "site",
  "src",
  "components",
  "components",
  "patternSourceLoaders.ts",
);

const examples = [
  ["announcement-dialog", "AnnouncementDialog"],
  ["app-header", "AppHeader"],
  ["breadcrumbs", "Breadcrumbs"],
  ["button-bar", "ButtonBar"],
  ["comments", "Default"],
  ["contact-details", "ContactDetails"],
  ["content-status", "Info"],
  ["experience-customization", "StandardControls"],
  ["file-upload", "FileUploadExample"],
  ["formatted-input", "PhoneNumber"],
  ["forms", "StandardLayout"],
  ["indication", "Status"],
  ["international-phone-number-input", "Column"],
  ["keyboard-shortcuts", "WithDialog"],
  ["list-builder", "SingleSelect"],
  ["menu-button", "MenuButton"],
  ["metric", "Metric"],
  ["navigation", "Navigation"],
  ["preferences-dialog", "PreferencesDialog"],
  ["search", "DefaultIcon"],
  ["selectable-card", "SingleSelection"],
  ["split-button", "Primary"],
  ["vertical-navigation", "SingleLevel"],
  ["wizard", "Horizontal"],
].map(([id, exportName]) => ({
  id,
  exportName,
  route: `/salt/patterns/${id}`,
  entry: `patterns/${id}/index.tsx`,
}));

const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
function toPosix(value) {
  return value.split(path.sep).join("/");
}

function packageName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

async function isFile(candidate) {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
}

async function resolveRelativeImport(importer, specifier) {
  const base = path.resolve(path.dirname(importer), specifier);
  const candidates = [];

  if (path.extname(specifier)) {
    candidates.push(base);
  } else {
    for (const extension of ["", ".ts", ".tsx", ".js", ".jsx"]) {
      candidates.push(`${base}${extension}`);
    }
    for (const extension of [".ts", ".tsx", ".js", ".jsx"]) {
      candidates.push(path.join(base, `index${extension}`));
    }
  }

  const matches = [];
  for (const candidate of candidates) {
    if (await isFile(candidate)) {
      matches.push(path.normalize(candidate));
    }
  }

  assert.equal(
    matches.length,
    1,
    `${toPosix(path.relative(repositoryRoot, importer))}: ${specifier} must resolve to exactly one file; found ${matches.length}`,
  );
  assert.ok(
    matches[0].startsWith(`${examplesRoot}${path.sep}`),
    `${specifier} escapes the public examples directory`,
  );
  return matches[0];
}

async function discover(entry) {
  const pending = [path.join(examplesRoot, entry)];
  const files = new Set();
  const externalDependencies = new Set();
  const saltPackages = new Set();

  while (pending.length > 0) {
    const current = pending.pop();
    if (files.has(current)) continue;
    assert.ok(await isFile(current), `${entry}: missing ${current}`);
    files.add(current);

    if (!/\.(?:[cm]?[jt]sx?|css)$/.test(current)) continue;
    const source = await readFile(current, "utf8");
    if (/\.tsx$/.test(current)) externalDependencies.add("react");
    importPattern.lastIndex = 0;

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (specifier.startsWith(".")) {
        pending.push(await resolveRelativeImport(current, specifier));
      } else {
        const dependency = packageName(specifier);
        if (dependency.startsWith("@salt-ds/")) {
          saltPackages.add(dependency);
        } else {
          externalDependencies.add(dependency);
        }
      }
    }
  }

  return {
    files: [...files]
      .map((file) => toPosix(path.relative(examplesRoot, file)))
      .sort(),
    externalDependencies: [...externalDependencies].sort(),
    saltPackages: [...saltPackages].sort(),
  };
}

async function expectedManifest() {
  const entries = [];
  for (const example of examples) {
    entries.push({
      ...example,
      visibility: "public",
      stability: "stable",
      provenance: "authored_example",
      sourceAuthority: {
        implementation: `site/src/examples/${example.entry}`,
        guidance: `site/docs/patterns/${example.id}.mdx`,
        maintainerFacade: `packages/core/stories/patterns/${
          example.id === "international-phone-number-input"
            ? "international-phone-number"
            : example.id
        }/${
          example.id === "international-phone-number-input"
            ? "international-phone-number"
            : example.id
        }.stories.tsx`,
      },
      ...(await discover(example.entry)),
    });
  }
  return {
    $schema:
      "https://www.saltdesignsystem.com/ai/schemas/salt-authored-example-manifest-1.json",
    schemaVersion: "1.0.0",
    contract: "salt-authored-example-manifest/1",
    examples: entries,
  };
}

function expectedSourceLoaders(manifest) {
  const files = [
    ...new Set(
      manifest.examples.flatMap(({ files }) =>
        files.filter((file) => /\.(?:css|js|jsx|ts|tsx)$/.test(file)),
      ),
    ),
  ].sort();
  const entries = files.map(
    (file) =>
      `  ${JSON.stringify(file)}: () => import(${JSON.stringify(`../../examples/${file}?raw`)}),`,
  );
  const modules = manifest.examples.map(
    ({ id }) =>
      `  ${JSON.stringify(id)}: () => import(${JSON.stringify(`../../examples/patterns/${id}`)}),`,
  );
  return [
    "// Generated by scripts/checkPublicExamples.mjs. Do not edit by hand.",
    "export const patternExampleLoaders = {",
    ...modules,
    "} as const;",
    "",
    "export const patternSourceLoaders = {",
    ...entries,
    "} as const;",
    "",
  ].join("\n");
}

async function compileExtractedExample(tempRoot, example) {
  for (const file of example.files) {
    const source = path.join(examplesRoot, file);
    const target = path.join(tempRoot, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(source));
  }

  const external = [...example.externalDependencies, ...example.saltPackages].flatMap(
    (dependency) => [dependency, `${dependency}/*`],
  );
  await build({
    absWorkingDir: tempRoot,
    bundle: true,
    entryPoints: [example.entry],
    external,
    format: "esm",
    jsx: "automatic",
    loader: {
      ".jpeg": "file",
      ".jpg": "file",
      ".png": "file",
      ".svg": "file",
    },
    logLevel: "silent",
    outdir: path.join(tempRoot, "build", example.id),
    write: false,
  });
}

const expected = await expectedManifest();
const expectedLoaders = expectedSourceLoaders(expected);

if (process.argv.includes("--write-manifest")) {
  await writeFile(manifestPath, `${JSON.stringify(expected, null, 2)}\n`);
  await writeFile(sourceLoadersPath, expectedLoaders);
  console.log(`Wrote ${toPosix(path.relative(repositoryRoot, manifestPath))}`);
  console.log(`Wrote ${toPosix(path.relative(repositoryRoot, sourceLoadersPath))}`);
  process.exit(0);
}

const actual = JSON.parse(await readFile(manifestPath, "utf8"));
assert.deepEqual(
  actual,
  expected,
  "The public example manifest is stale or its dependency closure is incomplete. Run `yarn examples:manifest` and review the diff.",
);
assert.equal(actual.contract, "salt-authored-example-manifest/1");
assert.equal(new Set(actual.examples.map(({ id }) => id)).size, 24);
assert.ok(
  actual.examples.every(
    (entry) =>
      entry.visibility === "public" &&
      entry.stability === "stable" &&
      entry.provenance === "authored_example",
  ),
  "Every authored example needs explicit visibility, stability, and provenance",
);
assert.equal(
  await readFile(sourceLoadersPath, "utf8"),
  expectedLoaders,
  "The generated public-example source loader map is stale. Run `yarn examples:manifest` and review the diff.",
);

const extractionRoot = await mkdtemp(
  path.join(tmpdir(), "salt-public-examples-"),
);
try {
  for (const example of actual.examples) {
    const entrySource = await readFile(
      path.join(examplesRoot, example.entry),
      "utf8",
    );
    assert.match(
      entrySource,
      new RegExp(`export\\s+(?:const|function)\\s+${example.exportName}\\b`),
      `${example.id}: missing export ${example.exportName}`,
    );
    await compileExtractedExample(extractionRoot, example);
  }
} finally {
  await rm(extractionRoot, { recursive: true, force: true });
}

console.log(
  `Verified ${actual.examples.length} complete public pattern examples and their extracted builds.`,
);
