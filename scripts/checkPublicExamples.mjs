import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { build } from "esbuild";
import micromatch from "micromatch";

import { repositoryTextBytes } from "./saltAiEvidenceUtils.mjs";

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
const workflowApplication = "examples/apps/operations-dashboard";
const workflowApplicationRoot = path.join(repositoryRoot, workflowApplication);
const workflowRecipePath = `${workflowApplication}/src/workflows/record-form/recipe.json`;
const workflowRecipeAbsolutePath = path.join(
  repositoryRoot,
  workflowRecipePath,
);
const currentManifestSchemaPath = path.join(
  repositoryRoot,
  "scripts",
  "schemas",
  "saltAuthoredExampleManifestV2.schema.json",
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
  const { recipe: workflowRecipe } = await validateWorkflowRecipe();
  return {
    $schema:
      "https://www.saltdesignsystem.com/ai/schemas/salt-authored-example-manifest-2.json",
    schemaVersion: "2.0.0",
    contract: "salt-authored-example-manifest/2",
    examples: entries,
    workflows: [
      {
        id: workflowRecipe.id,
        title: workflowRecipe.title,
        route: "/salt/patterns/forms",
        recipe: workflowRecipePath,
        visibility: "public",
        stability: "experimental",
        provenance: "authored_workflow",
      },
    ],
  };
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

async function workflowInputPaths(assembler) {
  const [recipeInput, semanticPatterns, publicationPatterns] =
    await Promise.all([
      readFile(workflowRecipeAbsolutePath, "utf8").then(JSON.parse),
      readFile(
        path.join(
          repositoryRoot,
          "packages/knowledge/src/build/catalogSemanticInputPatterns.json",
        ),
        "utf8",
      ).then(JSON.parse),
      readFile(
        path.join(
          repositoryRoot,
          "packages/knowledge/src/build/catalogPublicationInputPatterns.json",
        ),
        "utf8",
      ).then(JSON.parse),
    ]);
  const recipe = assembler.parseWorkflowRecipeDeclaration(recipeInput);
  assert.equal(
    recipe.source?.application,
    workflowApplication,
    "Workflow recipe must stay in the named application",
  );
  const semanticPaths = [
    workflowRecipePath,
    ...recipe.source.reusable_form_files.map(
      (file) => `${workflowApplication}/${file}`,
    ),
    `${workflowApplication}/${recipe.setup.dependency_manifest}`,
    ...recipe.source.canonical_guidance.map(
      (reference) => reference.split("#", 1)[0],
    ),
  ].sort();
  const publicationPaths = recipe.source.demo_application_files
    .filter((file) => file !== recipe.setup.dependency_manifest)
    .map((file) => `${workflowApplication}/${file}`)
    .sort();

  for (const relative of semanticPaths) {
    assert.ok(
      micromatch.isMatch(relative, semanticPatterns),
      `Workflow semantic input is not registered: ${relative}`,
    );
    if (relative.startsWith(`${workflowApplication}/`)) {
      assert.ok(
        semanticPatterns.includes(relative),
        `Workflow application semantic input must use an exact registration: ${relative}`,
      );
    }
  }
  assert.deepEqual(
    publicationPaths,
    [...publicationPatterns].sort(),
    "Workflow demo-only files must exactly match the publication input registration",
  );
  return { recipe, semanticPaths, publicationPaths };
}

async function workflowInputInventory(paths) {
  const entries = [];
  for (const relative of [...paths].sort()) {
    const bytes = repositoryTextBytes(
      await readFile(path.join(repositoryRoot, relative)),
    );
    entries.push({
      path: relative,
      sha256: sha256(bytes),
      bytes: bytes.byteLength,
    });
  }
  return {
    entries,
    digest: sha256(Buffer.from(JSON.stringify(entries), "utf8")),
  };
}

let workflowAssemblerPromise;
async function workflowAssembler() {
  workflowAssemblerPromise ??= (async () => {
    const cacheRoot = path.join(repositoryRoot, "node_modules", ".cache");
    await mkdir(cacheRoot, { recursive: true });
    const outputRoot = await mkdtemp(path.join(cacheRoot, "salt-workflow-"));
    const outfile = path.join(outputRoot, "assembler.mjs");
    try {
      await build({
        bundle: true,
        entryPoints: [
          path.join(
            repositoryRoot,
            "packages",
            "knowledge",
            "src",
            "build",
            "assembleWorkflowRecipe.ts",
          ),
        ],
        format: "esm",
        logLevel: "silent",
        outfile,
        packages: "external",
        platform: "node",
      });
      return await import(pathToFileURL(outfile).href);
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  })();
  return workflowAssemblerPromise;
}

let currentWorkflowPromise;
async function validateWorkflowRecipe() {
  currentWorkflowPromise ??= (async () => {
    const assembler = await workflowAssembler();
    const inputs = await workflowInputPaths(assembler);
    const [semanticInputInventory, publicationInputInventory] =
      await Promise.all([
        workflowInputInventory(inputs.semanticPaths),
        workflowInputInventory(inputs.publicationPaths),
      ]);
    const packageManifest = JSON.parse(
      await readFile(
        path.join(workflowApplicationRoot, "package.json"),
        "utf8",
      ),
    );
    const compatibility = {
      packages: Object.entries(packageManifest.dependencies)
        .filter(([name]) => name.startsWith("@salt-ds/"))
        .map(([name, tested_version]) => ({ name, tested_version })),
    };
    const assembled = await assembler.assembleWorkflowRecipe({
      sourceRoot: repositoryRoot,
      semanticInputInventory,
      publicationInputInventory,
      compatibility,
    });
    return {
      ...assembled,
      recipe: inputs.recipe,
      packageManifest,
    };
  })();
  return currentWorkflowPromise;
}

async function compileExtractedWorkflow(tempRoot, workflow) {
  const publicFileByArtifact = new Map(
    workflow.publicFiles.map((file) => [file.artifactPath, file]),
  );
  for (const file of workflow.recipeArtifact.files) {
    const publicFile = publicFileByArtifact.get(file.artifact_path);
    assert.ok(
      publicFile,
      `Workflow artifact bytes are missing: ${file.artifact_path}`,
    );
    const target = path.join(tempRoot, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, publicFile.bytes);
  }
  const external = [
    ...Object.keys(workflow.packageManifest.dependencies ?? {}),
    ...Object.keys(workflow.packageManifest.devDependencies ?? {}),
  ].flatMap((dependency) => [dependency, `${dependency}/*`]);
  for (const entryPoint of [
    "src/workflows/record-form/RecordForm.tsx",
    "src/main.tsx",
  ]) {
    await build({
      absWorkingDir: tempRoot,
      bundle: true,
      entryPoints: [entryPoint],
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
      outdir: path.join(tempRoot, "build", path.basename(entryPoint)),
      write: false,
    });
  }
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

  const external = [
    ...example.externalDependencies,
    ...example.saltPackages,
  ].flatMap((dependency) => [dependency, `${dependency}/*`]);
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
  console.log(
    `Wrote ${toPosix(path.relative(repositoryRoot, sourceLoadersPath))}`,
  );
  process.exit(0);
}

const actual = JSON.parse(await readFile(manifestPath, "utf8"));
const currentManifestSchema = JSON.parse(
  await readFile(currentManifestSchemaPath, "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateCurrentManifest = ajv.compile(currentManifestSchema);
assert.ok(
  validateCurrentManifest(actual),
  `Current authored example manifest schema failure: ${ajv.errorsText(
    validateCurrentManifest.errors,
    { separator: "; " },
  )}`,
);
assert.deepEqual(
  actual,
  expected,
  "The public example manifest is stale or its dependency closure is incomplete. Run `yarn examples:manifest` and review the diff.",
);
assert.equal(actual.contract, "salt-authored-example-manifest/2");
assert.equal(new Set(actual.examples.map(({ id }) => id)).size, 24);
assert.deepEqual(
  actual.workflows.map(({ id }) => id),
  ["operations-dashboard.record-form"],
  "The current manifest must register exactly the selected workflow",
);
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
  repositoryTextBytes(await readFile(sourceLoadersPath)).toString("utf8"),
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
  await compileExtractedWorkflow(
    extractionRoot,
    await validateWorkflowRecipe(),
  );
} finally {
  await rm(extractionRoot, { recursive: true, force: true });
}

console.log(
  `Verified ${actual.examples.length} complete public pattern examples and ${actual.workflows.length} workflow recipe with extracted builds.`,
);
