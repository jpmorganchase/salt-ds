import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  parseArgs,
  readJson,
  repositoryRoot,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const authoringStage = String(args.get("--authoring-stage") ?? "06d");
const visibilityStage = String(args.get("--visibility-stage") ?? authoringStage);
assert(
  ["06a", "06b", "06c", "06d"].includes(authoringStage),
  "--authoring-stage must be 06a, 06b, 06c, or 06d",
);
assert(
  ["06a", "06b", "06c", "06d"].includes(visibilityStage),
  "--visibility-stage must be 06a, 06b, 06c, or 06d",
);
const migrationBatch = args.get("--migration-batch");
assert(
  migrationBatch === undefined || migrationBatch === "06b" || migrationBatch === "06c",
  "--migration-batch must be 06b or 06c",
);
if (migrationBatch !== undefined) {
  assert(migrationBatch === authoringStage, "Migration and authoring stages must match");
}

function absolute(relative) {
  const value = path.resolve(repositoryRoot, ...relative.split("/"));
  const containment = path.relative(repositoryRoot, value);
  assert(
    containment.length > 0 &&
      !containment.startsWith("..") &&
      !path.isAbsolute(containment),
    `${relative} escapes the repository`,
  );
  return value;
}

async function exists(relative) {
  try {
    const value = await stat(absolute(relative));
    return value.isFile() || value.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function walk(relativeRoot, predicate = () => true) {
  const results = [];
  const pending = [absolute(relativeRoot)];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(child);
      else if (predicate(child)) {
        results.push(path.relative(repositoryRoot, child).replaceAll("\\", "/"));
      }
    }
  }
  return results.sort();
}

async function validateSchema(schemaName, documentPath, label) {
  const [schema, document] = await Promise.all([
    readJson(absolute(`scripts/schemas/${schemaName}`)),
    readJson(absolute(documentPath)),
  ]);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  assert(
    validate(document),
    `${label} schema failure: ${ajv.errorsText(validate.errors, {
      separator: "; ",
    })}`,
  );
  return document;
}

function gitChangedPaths(checkpoint) {
  return execFileSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACMRT", `${checkpoint}..HEAD`],
    { cwd: repositoryRoot, encoding: "utf8", windowsHide: true },
  )
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((entry) => entry.replaceAll("\\", "/"))
    .sort();
}

function docRoute(relative) {
  const value = relative.slice("site/docs/".length, -".mdx".length);
  return value.endsWith("/index")
    ? `/salt/${value.slice(0, -"/index".length)}`
    : `/salt/${value}`;
}

function links(source) {
  return [
    ...source.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu),
    ...source.matchAll(/\b(?:href|src|srcDark)=["']([^"']+)["']/gu),
  ].map((match) => match[1]);
}

function assertAccessibleImages(source, relative) {
  for (const match of source.matchAll(/!\[([^\]]*)\]\([^)]+\)/gu)) {
    assert(match[1].trim(), `${relative} has a Markdown image without alternative text`);
  }
  for (const match of source.matchAll(/<(?:Diagram|img)\b[\s\S]*?>/gu)) {
    assert(
      /\balt=["'][^"']+["']/u.test(match[0]),
      `${relative} has an image without useful alternative text`,
    );
  }
  for (const match of source.matchAll(/<ImageSwitcher\b[\s\S]*?\/>/gu)) {
    const imageObjects = [...match[0].matchAll(/\{\s*src:\s*["'][^"']+["'][\s\S]*?\}/gu)];
    assert(imageObjects.length > 0, `${relative} has an empty ImageSwitcher`);
    for (const image of imageObjects) {
      assert(
        /\balt:\s*["'][^"']+["']/u.test(image[0]),
        `${relative} has an ImageSwitcher image without useful alternative text`,
      );
    }
  }
}

function assertSupportedProjection(source, relative) {
  for (const token of [
    "@storybook/addon-docs",
    "@storybook/blocks",
    "<Meta",
    "<Canvas",
    "<ArgTypes",
  ]) {
    assert(!source.includes(token), `${relative} uses unsupported MDX projection ${token}`);
  }
}

function assertStrictAuthoredDoc(source, relative) {
  assertSupportedProjection(source, relative);
  assertAccessibleImages(source, relative);
  assert(
    !/https:\/\/storybook\.saltdesignsystem\.com/iu.test(source),
    `${relative} exposes Storybook as public guidance`,
  );
  assert(
    !/https:\/\/github\.com\/jpmorganchase\/salt-ds\/issues/iu.test(source),
    `${relative} uses GitHub Issues as public support`,
  );
  if (/\/index\.mdx$/u.test(relative) || relative.startsWith("site/docs/patterns/")) {
    for (const field of ["summary:", "applicability:", "stability:", "provenance:"]) {
      assert(source.includes(field), `${relative} is missing authored ${field.slice(0, -1)}`);
    }
  }
  for (const object of source.matchAll(/\{\s*href:\s*["']https:\/\/go(?:\/|["'])[^}]*\}/gu)) {
    assert(/\binternal:\s*true/u.test(object[0]), `${relative} has an unlabelled internal resource`);
    assert(/\bpublicFallback:/u.test(object[0]), `${relative} internal resource lacks an authored public fallback`);
  }
}

const visibility = await validateSchema(
  "saltContentVisibilityV1.schema.json",
  "tooling/ai/content-visibility-v1.json",
  "Content visibility inventory",
);
const packageDocs = await validateSchema(
  "saltPublicPackageDocsV1.schema.json",
  "tooling/ai/public-package-docs-v1.json",
  "Public package docs inventory",
);
const examples = await validateSchema(
  "saltAuthoredExampleManifestV1.schema.json",
  "site/src/examples/patterns/manifest.json",
  "Authored example manifest",
);
const migration = await readJson(absolute("tooling/ai/pattern-migration-v1.json"));

assert(
  visibility.authoring_baseline.checkpoint_sha === packageDocs.authoring_baseline.checkpoint_sha &&
    visibility.authoring_baseline.checkpoint_sha === migration.checkpoint_sha,
  "Authoring, package, and migration baselines disagree",
);
assert(
  JSON.stringify(visibility.provenance_kinds) ===
    JSON.stringify([
      "authored_normative_guidance",
      "generated_api_fact",
      "inferred_implementation_signal",
      "test_receipt",
    ]),
  "Required provenance kinds are not distinct",
);

const changedPaths = gitChangedPaths(visibility.authoring_baseline.checkpoint_sha);
const strictRoots = visibility.authoring_baseline.strict_paths;
const strictFiles = new Set(
  changedPaths.filter(
    (relative) =>
      relative.startsWith("site/docs/") ||
      strictRoots.some(
        (root) => relative === root || relative.startsWith(`${root}/`),
      ),
  ),
);
for (const root of strictRoots) {
  for (const relative of await walk(root, (file) => /\.(?:md|mdx)$/u.test(file))) {
    strictFiles.add(relative);
  }
}

const templateText = (
  await Promise.all(
    [...strictFiles]
      .filter((relative) => relative.startsWith("templates/"))
      .map((relative) => readFile(absolute(relative), "utf8")),
  )
).join("\n");
for (const token of [
  "summary",
  "When to use",
  "When not to use",
  "Import",
  "Provider",
  "applicability",
  "stability",
  "manifest",
  "Keyboard",
  "accessibility",
  "Deprecations and migrations",
  "Related records",
  "authored_normative_guidance",
]) {
  assert(templateText.toLowerCase().includes(token.toLowerCase()), `Authoring templates omit ${token}`);
}

for (const relative of strictFiles) {
  const source = await readFile(absolute(relative), "utf8");
  if (relative.startsWith("site/docs/")) assertStrictAuthoredDoc(source, relative);
  else assertAccessibleImages(source, relative);
}

execFileSync(process.execPath, [absolute("scripts/checkPublicExamples.mjs")], {
  cwd: repositoryRoot,
  stdio: "inherit",
  windowsHide: true,
});

const exampleIds = examples.examples.map((entry) => entry.id);
assert(
  new Set(exampleIds).size === 24 &&
    JSON.stringify(exampleIds) === JSON.stringify([...exampleIds].sort()),
  "Authored example IDs are not unique and path-sorted",
);
const routes = examples.examples.map((entry) => entry.route);
assert(new Set(routes).size === routes.length, "Authored examples repeat a canonical route");
for (const entry of examples.examples) {
  assert(entry.route === `/salt/patterns/${entry.id}`, `${entry.id} route is not canonical`);
  assert(entry.entry === `patterns/${entry.id}/index.tsx`, `${entry.id} entry is not canonical`);
  for (const sourcePath of Object.values(entry.sourceAuthority)) {
    assert(await exists(sourcePath), `${entry.id} source authority is missing: ${sourcePath}`);
  }
  assert(
    entry.files.includes(entry.entry) &&
      entry.files.every((file) => !file.includes("..")),
    `${entry.id} dependency closure is incomplete or unsafe`,
  );
}

const mdxFiles = await walk("site/docs", (file) => file.endsWith(".mdx"));
const routeOwners = new Map();
for (const relative of mdxFiles) {
  const source = await readFile(absolute(relative), "utf8");
  const primary = docRoute(relative);
  const declared = [
    primary,
    ...(path.posix.basename(relative) === "index.mdx"
      ? [`${primary.replace(/\/$/u, "")}/index`]
      : []),
    ...[...source.matchAll(/^\s*-\s+(\/salt\/[^\s]+)\s*$/gmu)].map(
      (match) => match[1].replace(/\/$/u, ""),
    ),
  ];
  for (const route of declared) {
    const existing = routeOwners.get(route);
    assert(!existing || existing === relative, `Duplicate canonical route ${route}: ${existing}, ${relative}`);
    routeOwners.set(route, relative);
  }
}
routeOwners.set("/salt", "site/docs/index.mdx");

for (const relative of mdxFiles) {
  const source = await readFile(absolute(relative), "utf8");
  for (const href of links(source)) {
    if (/^(?:<?https?:|mailto:|tel:|#|data:)/u.test(href) || href.includes("{")) continue;
    const target = href.split(/[?#]/u)[0];
    if (!target) continue;
    if (target.startsWith("/img/")) {
      assert(await exists(`site/public${target}`), `${relative} has a broken image ${target}`);
    } else if (target.startsWith("/salt/")) {
      const normalized = target.replace(/\/$/u, "");
      assert(routeOwners.has(normalized), `${relative} has a broken public route ${target}`);
    } else if (!target.startsWith("/")) {
      const base = path.posix.dirname(relative);
      const resolved = path.posix.normalize(path.posix.join(base, target));
      assert(
        (await exists(resolved)) ||
          (await exists(`${resolved}.mdx`)) ||
          (await exists(`${resolved}/index.mdx`)),
        `${relative} has a broken relative link ${href}`,
      );
    }
  }
}

const packageNames = packageDocs.packages.map((entry) => entry.name);
assert(
  new Set(packageNames).size === packageNames.length &&
    JSON.stringify(packageNames) === JSON.stringify([...packageNames].sort()),
  "Public package docs entries are not unique and package-sorted",
);
const worklist = new Map(
  packageDocs.remediation_worklist.map((entry) => [entry.name, entry]),
);
assert(worklist.size === packageDocs.remediation_worklist.length, "Package remediation worklist repeats a package");
for (const entry of packageDocs.packages) {
  if (entry.workspace_path === null) continue;
  const manifest = await readJson(absolute(`${entry.workspace_path}/package.json`));
  const readmePresent = await exists(entry.readme_path);
  const deficits = [
    ...(!readmePresent ? ["readme"] : []),
    ...(manifest.description === undefined ? ["description"] : []),
    ...(manifest.homepage === undefined ? ["homepage"] : []),
    ...(manifest.keywords === undefined ? ["keywords"] : []),
    ...(manifest.bugs === undefined ? ["bugs"] : []),
    ...(manifest.publishIncludeReadme === false ? ["packed_readme"] : []),
  ].sort();
  const frozen = [...(worklist.get(entry.name)?.deficits ?? [])].sort();
  assert(
    JSON.stringify(deficits) === JSON.stringify(frozen),
    `${entry.name} package-doc deficits changed: expected ${frozen.join(", ") || "none"}; found ${deficits.join(", ") || "none"}`,
  );
  if (authoringStage === "06d" && worklist.get(entry.name)?.due_unit === "06d") {
    assert(deficits.length === 0, `${entry.name} did not close its 06d package-doc worklist`);
  }
}

const builtManifest = await readJson(absolute("dist/salt-ds-knowledge/manifest.json"));
for (const vector of builtManifest.compatibility.packages) {
  const family = packageDocs.packages.find((entry) => entry.name === vector.name);
  assert(family?.workspace_path, `Knowledge package vector contains unknown family ${vector.name}`);
  const manifest = await readJson(absolute(`${family.workspace_path}/package.json`));
  assert(
    manifest.version === vector.tested_version,
    `${vector.name} package vector is stale (${vector.tested_version} != ${manifest.version})`,
  );
}

const unclassified = visibility.unclassified.map((entry) => entry.path);
assert(
  JSON.stringify(unclassified) === JSON.stringify([...unclassified].sort()),
  "Visibility remainder is not path-sorted",
);
for (const entry of visibility.unclassified) {
  const batchEntry = visibility.closure_batches.find(
    (candidate) => candidate.id === entry.closure_batch,
  );
  assert(batchEntry?.paths.includes(entry.path), `${entry.path} has no frozen closure batch`);
}
if (args.get("--require-visibility-closure")) {
  assert(unclassified.length === 0, `Visibility closure still has ${unclassified.length} entries`);
}
if (args.get("--require-storybook-independent")) {
  const semanticPatterns = await readJson(
    absolute("packages/knowledge/src/build/catalogSemanticInputPatterns.json"),
  );
  assert(
    semanticPatterns.every((entry) => !entry.includes("/stories/")),
    "Knowledge semantic inputs still include Storybook stories",
  );
  const runtimeFiles = [
    ...(await walk("dist/salt-ds-knowledge", (file) => /\.(?:js|json|md)$/u.test(file))),
    ...(await walk("dist/salt-ds-cli", (file) => /\.(?:js|json|md)$/u.test(file))),
    ...(await walk("site/src/examples", (file) => /\.(?:js|jsx|ts|tsx|json|md)$/u.test(file))),
  ];
  for (const relative of runtimeFiles) {
    const source = await readFile(absolute(relative), "utf8");
    assert(!source.includes("@storybook/"), `${relative} retains a Storybook runtime dependency`);
  }
}

const webRouteMap = args.get("--require-web-route-map");
if (webRouteMap) {
  const routeMap = await readJson(absolute(String(webRouteMap)));
  assert(Array.isArray(routeMap.routes) && routeMap.routes.length > 0, "Web route map is empty");
  for (const route of routeMap.routes) {
    assert(route.sha256 && route.media_type && route.path, "Web route map entry is incomplete");
  }
} else {
  assert(authoringStage !== "06d", "06d requires --require-web-route-map");
}

assert(
  migration.patterns.length === 24 && migration.package_stories.length === 8,
  "Story disposition inventory is incomplete",
);
console.log(
  `Salt docs authoring ${authoringStage} verified (${examples.examples.length} authored examples, ${mdxFiles.length} MDX files, ${unclassified.length} staged visibility entries, ${packageDocs.remediation_worklist.length} package worklist entries).`,
);
