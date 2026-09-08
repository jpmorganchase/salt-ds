import path from "node:path";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import type {
  DocumentBlock,
  DocumentModel,
} from "../documents/documentSchema.js";
import {
  type AuthoredWorkflowRecipe,
  parseAuthoredWorkflowRecipe,
} from "../documents/workflowRecipeSchema.js";
import { toPosixPath } from "../registry/paths.js";
import { readCatalogInputFile } from "./catalogInputInventory.js";
import { parseYamlFrontmatter } from "./parseYamlFrontmatter.js";
import {
  parseSelectedMdxDocument,
  type SelectedMdxSectionSelector,
} from "./selectedMdxDocument.js";

const FORMS_DOCUMENT_PATH = "site/docs/patterns/forms.mdx";
const BUTTON_DOCUMENT_PATH = "site/docs/components/button/examples.mdx";
const FORMS_STANDARD_LAYOUT_SOURCE_PATH =
  "site/src/examples/patterns/forms/index.tsx";
const BUTTON_LOADING_SOURCE_PATH = "site/src/examples/button/Loading.tsx";
// These existing site previews belong to the selected document descriptors,
// separately from the recipe's app files. Their reads remain in the sealed
// compiler input inventory and their paths enter the returned guide provenance.
const SELECTED_PREVIEW_SOURCE_PATHS = new Set([
  FORMS_STANDARD_LAYOUT_SOURCE_PATH,
  BUTTON_LOADING_SOURCE_PATH,
]);

const FORMS_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  { id: "forms.overview", heading_path: [], include_descendants: false },
  {
    id: "forms.when-to-use",
    heading_path: ["When to use"],
    include_descendants: false,
  },
  {
    id: "forms.when-not-to-use",
    heading_path: ["When not to use"],
    include_descendants: false,
  },
  {
    id: "forms.how-to-build",
    heading_path: ["How to build"],
    include_descendants: false,
  },
  {
    id: "forms.submission-and-recovery",
    heading_path: ["How to build", "Submission and recovery"],
    include_descendants: false,
  },
  {
    id: "forms.anatomy",
    heading_path: ["How to build", "Anatomy"],
    include_descendants: false,
  },
  {
    id: "forms.standard-layout",
    heading_path: ["How to build", "Standard layout"],
    include_descendants: true,
  },
];

const BUTTON_LOADING_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "button.loading",
    heading_path: ["Loading"],
    include_descendants: true,
  },
];

export interface SelectedGuidanceFile {
  sourcePath: string;
  language: "tsx" | "css" | "json" | "text";
  code: string;
}

export interface SelectedGuidance {
  id: string;
  name: string;
  aliases: string[];
  summary: string;
  kind: "workflow" | "component-guidance";
  document: DocumentModel;
  recipeManifest: string | null;
  sourcePaths: string[];
  componentNames: string[];
  packageNames: string[];
  attach: {
    componentNames: string[];
    patternNames: string[];
    pageSourcePaths: string[];
  };
  files: SelectedGuidanceFile[];
  limitations: string[];
}

export interface BuildSelectedGuidanceInput {
  sourceRoot: string;
  workflow: {
    id: string;
    title: string;
    recipeSourcePath: string;
    manifestPath: string;
    semanticSourcePaths: string[];
    minimumPackageNames: string[];
  } | null;
}

interface ParsedSelectedDocument {
  document: DocumentModel;
  title: string;
}

interface PreviewReference {
  componentName: string;
  exampleName: string;
  block: Extract<DocumentBlock, { kind: "live_preview" }>;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function assertPortablePath(value: string, label: string): string {
  if (!isPortableRepositoryPath(value)) {
    throw new Error(
      `${label} must be a portable repository-relative path: ${value}.`,
    );
  }
  return value;
}

function resolveSourcePath(sourceRoot: string, sourcePath: string): string {
  const portablePath = assertPortablePath(
    sourcePath,
    "Selected guidance source path",
  );
  const root = path.resolve(sourceRoot);
  const resolved = path.resolve(root, portablePath);
  const relative = toPosixPath(path.relative(root, resolved));
  if (relative !== portablePath) {
    throw new Error(
      `Selected guidance source path escapes its repository root: ${sourcePath}.`,
    );
  }
  return resolved;
}

function declaredSourcePaths(paths: readonly string[]): Set<string> {
  const result = new Set<string>();
  for (const sourcePath of paths) {
    const portablePath = assertPortablePath(
      sourcePath,
      "Selected guidance semantic source path",
    );
    if (result.has(portablePath)) {
      throw new Error(
        `Selected guidance semantic source path is duplicated: ${portablePath}.`,
      );
    }
    result.add(portablePath);
  }
  return result;
}

function assertDeclared(
  declared: ReadonlySet<string>,
  sourcePath: string,
): string {
  const portablePath = assertPortablePath(
    sourcePath,
    "Selected guidance source path",
  );
  if (!declared.has(portablePath)) {
    throw new Error(
      `Selected guidance attempted to read an undeclared semantic input: ${portablePath}.`,
    );
  }
  return portablePath;
}

async function readDeclaredText(input: {
  sourceRoot: string;
  declared: ReadonlySet<string>;
  sourcePath: string;
}): Promise<string> {
  const sourcePath = assertDeclared(input.declared, input.sourcePath);
  return readCatalogInputFile(
    resolveSourcePath(input.sourceRoot, sourcePath),
    "utf8",
  );
}

function frontmatterTitle(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof (data as { title?: unknown }).title === "string" &&
    (data as { title: string }).title.trim().length > 0
  ) {
    return (data as { title: string }).title.trim();
  }
  return fallback;
}

async function parseSelectedDocument(input: {
  sourceRoot: string;
  declared: ReadonlySet<string>;
  sourcePath: string;
  documentId: string;
  route: string;
  selectors: readonly SelectedMdxSectionSelector[];
  fallbackTitle: string;
}): Promise<ParsedSelectedDocument> {
  const raw = await readDeclaredText(input);
  const parsed = parseYamlFrontmatter(raw);
  return {
    title: frontmatterTitle(parsed.data, input.fallbackTitle),
    document: parseSelectedMdxDocument({
      source: {
        document_id: input.documentId,
        source_path: input.sourcePath,
        route: input.route,
      },
      mdx: parsed.content,
      selectors: input.selectors,
    }),
  };
}

function collectPreviews(blocks: readonly DocumentBlock[]): PreviewReference[] {
  const previews: PreviewReference[] = [];
  for (const block of blocks) {
    if (block.kind === "live_preview" && block.example_source_path) {
      previews.push({
        componentName: block.component_name,
        exampleName: block.example_name,
        block,
      });
    }
    if (block.kind === "guidance_callout" || block.kind === "diagram") {
      previews.push(...collectPreviews(block.blocks));
    }
  }
  return previews;
}

function requiredPreview(
  document: DocumentModel,
  componentName: string,
  exampleName: string,
  actualSourcePath: string,
): string {
  const matches = document.sections
    .flatMap((section) => collectPreviews(section.blocks))
    .filter(
      (preview) =>
        preview.componentName === componentName &&
        preview.exampleName === exampleName,
    );
  if (matches.length !== 1) {
    throw new Error(
      `Selected guidance requires exactly one LivePreview for ${componentName}/${exampleName}; found ${matches.length}.`,
    );
  }
  // The MDX AST proves the selected component/example pair. The Forms preview
  // is co-located with sibling exports in index.tsx, so its source artifact
  // deliberately differs from the convention-derived locator on the block.
  matches[0].block.example_source_path = actualSourcePath;
  return actualSourcePath;
}

function diagnosticsLimitations(
  document: DocumentModel,
  label: string,
): string[] {
  return document.diagnostics.map(
    (diagnostic) =>
      `${label} documentation diagnostic ${diagnostic.code}: ${diagnostic.message}`,
  );
}

function languageFor(sourcePath: string): SelectedGuidanceFile["language"] {
  if (sourcePath.endsWith(".tsx")) return "tsx";
  if (sourcePath.endsWith(".css")) return "css";
  if (sourcePath.endsWith(".json")) return "json";
  return "text";
}

async function readSelectedPreviewFile(input: {
  sourceRoot: string;
  sourcePath: string;
}): Promise<SelectedGuidanceFile> {
  if (!SELECTED_PREVIEW_SOURCE_PATHS.has(input.sourcePath)) {
    throw new Error(
      `Selected guidance preview source is not registered: ${input.sourcePath}.`,
    );
  }
  return {
    sourcePath: input.sourcePath,
    language: languageFor(input.sourcePath),
    code: await readCatalogInputFile(
      resolveSourcePath(input.sourceRoot, input.sourcePath),
      "utf8",
    ),
  };
}

function parsedManifest(
  manifest: string,
  manifestPath: string,
): AuthoredWorkflowRecipe {
  let raw: unknown;
  try {
    raw = JSON.parse(manifest) as unknown;
  } catch (error) {
    throw new Error(`Workflow recipe is not valid JSON: ${manifestPath}.`, {
      cause: error,
    });
  }
  return parseAuthoredWorkflowRecipe(raw);
}

function applicationPath(application: string, child: string): string {
  const result = toPosixPath(path.posix.join(application, child));
  return assertPortablePath(result, "Workflow recipe source path");
}

function packageNames(input: {
  packageManifest: string;
  minimumPackageNames: readonly string[];
}): string[] {
  let packageJson: unknown;
  try {
    packageJson = JSON.parse(input.packageManifest) as unknown;
  } catch (error) {
    throw new Error("Workflow package manifest is not valid JSON.", {
      cause: error,
    });
  }
  const record =
    packageJson &&
    typeof packageJson === "object" &&
    !Array.isArray(packageJson)
      ? (packageJson as Record<string, unknown>)
      : null;
  const dependencies = new Set<string>();
  for (const field of ["dependencies", "devDependencies"] as const) {
    const value = record?.[field];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    for (const name of Object.keys(value)) dependencies.add(name);
  }
  const requested = unique(input.minimumPackageNames);
  if (requested.length !== input.minimumPackageNames.length) {
    throw new Error(
      "Workflow minimum package names must be non-empty and unique.",
    );
  }
  for (const name of requested) {
    if (!dependencies.has(name)) {
      throw new Error(
        `Workflow package manifest does not declare required package '${name}'.`,
      );
    }
  }
  return requested.sort((left, right) => left.localeCompare(right, "en"));
}

function inlineText(blocks: readonly DocumentBlock[]): string[] {
  const text: string[] = [];
  for (const block of blocks) {
    if (block.kind === "paragraph" || block.kind === "heading") {
      const value = block.children
        .map((inline) => {
          if (inline.kind === "text" || inline.kind === "inline_code") {
            return inline.value;
          }
          if (
            inline.kind === "emphasis" ||
            inline.kind === "strong" ||
            inline.kind === "delete" ||
            inline.kind === "link"
          ) {
            return inline.children
              .map((child) =>
                child.kind === "text" || child.kind === "inline_code"
                  ? child.value
                  : "",
              )
              .join("");
          }
          return inline.kind === "break" ? " " : "";
        })
        .join("")
        .replace(/\s+/gu, " ")
        .trim();
      if (value) text.push(value);
    }
    if (block.kind === "guidance_callout" || block.kind === "diagram") {
      text.push(...inlineText(block.blocks));
    }
  }
  return text;
}

function summaryFromDocument(document: DocumentModel, label: string): string {
  const summary = document.sections
    .flatMap((section) => inlineText(section.blocks))
    .find((value) => value.length > 0);
  if (!summary) {
    throw new Error(
      `Selected ${label} guidance has no authored prose summary.`,
    );
  }
  return summary;
}

export async function buildSelectedGuidance(
  input: BuildSelectedGuidanceInput,
): Promise<SelectedGuidance[]> {
  if (!input.workflow) return [];

  const declared = declaredSourcePaths(input.workflow.semanticSourcePaths);
  const recipeSourcePath = assertDeclared(
    declared,
    input.workflow.recipeSourcePath,
  );
  const manifestPath = assertPortablePath(
    input.workflow.manifestPath,
    "Selected guidance recipe artifact path",
  );
  const manifest = await readDeclaredText({
    sourceRoot: input.sourceRoot,
    declared,
    sourcePath: recipeSourcePath,
  });
  const recipe = parsedManifest(manifest, recipeSourcePath);
  if (
    recipe.id !== input.workflow.id ||
    recipe.title !== input.workflow.title
  ) {
    throw new Error(
      `Workflow descriptor identity does not match ${recipeSourcePath}: expected '${input.workflow.id}' / '${input.workflow.title}'.`,
    );
  }

  const canonicalGuidance = new Set(recipe.source.canonical_guidance);
  if (
    !canonicalGuidance.has(FORMS_DOCUMENT_PATH) ||
    !canonicalGuidance.has(`${BUTTON_DOCUMENT_PATH}#loading`)
  ) {
    throw new Error(
      `Workflow recipe ${recipeSourcePath} must declare the canonical Forms and Button Loading guidance sources.`,
    );
  }

  const [forms, button] = await Promise.all([
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, FORMS_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/patterns/forms",
      selectors: FORMS_SELECTORS,
      fallbackTitle: "Forms",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, BUTTON_DOCUMENT_PATH),
      documentId: "guide.button.loading",
      route: "/salt/components/button/examples",
      selectors: BUTTON_LOADING_SELECTORS,
      fallbackTitle: "Button",
    }),
  ]);

  const formsPreviewPath = requiredPreview(
    forms.document,
    "patterns/forms",
    "StandardLayout",
    FORMS_STANDARD_LAYOUT_SOURCE_PATH,
  );
  const buttonPreviewPath = requiredPreview(
    button.document,
    "button",
    "Loading",
    BUTTON_LOADING_SOURCE_PATH,
  );
  const reusablePaths = recipe.source.reusable_form_files.map((sourcePath) =>
    assertDeclared(
      declared,
      applicationPath(recipe.source.application, sourcePath),
    ),
  );
  const packagePath = assertDeclared(
    declared,
    applicationPath(
      recipe.source.application,
      recipe.setup.dependency_manifest,
    ),
  );
  const packageManifest = await readDeclaredText({
    sourceRoot: input.sourceRoot,
    declared,
    sourcePath: packagePath,
  });
  const packages = packageNames({
    packageManifest,
    minimumPackageNames: input.workflow.minimumPackageNames,
  });

  const [formsFile, buttonFile] = await Promise.all([
    readSelectedPreviewFile({
      sourceRoot: input.sourceRoot,
      sourcePath: formsPreviewPath,
    }),
    readSelectedPreviewFile({
      sourceRoot: input.sourceRoot,
      sourcePath: buttonPreviewPath,
    }),
  ]);

  const buttonHeadings = button.document.sections
    .map((section) => section.heading_path.at(-1) ?? "Loading")
    .filter((heading) => heading.length > 0);
  const buttonHeading = buttonHeadings[0];
  if (!buttonHeading) {
    throw new Error(
      "Selected Button Loading guidance has no authored heading.",
    );
  }
  const buttonName = `Button ${buttonHeading}`;
  const formsLimitations = diagnosticsLimitations(forms.document, forms.title);
  const buttonLimitations = diagnosticsLimitations(button.document, buttonName);
  const workflowSourcePaths = unique([
    FORMS_DOCUMENT_PATH,
    recipeSourcePath,
    ...reusablePaths,
    packagePath,
    formsPreviewPath,
  ]);
  const workflowLimitations = unique([
    ...recipe.limitations,
    ...formsLimitations,
  ]);

  return [
    {
      id: recipe.id,
      name: recipe.title,
      aliases: unique([recipe.title, ...recipe.intent.aliases]),
      summary: recipe.intent.summary,
      kind: "workflow",
      document: forms.document,
      recipeManifest: manifestPath,
      sourcePaths: workflowSourcePaths,
      componentNames: ["Button", "Dialog", "Form field", "Input"],
      packageNames: packages,
      attach: {
        componentNames: [],
        patternNames: [forms.title],
        pageSourcePaths: [FORMS_DOCUMENT_PATH],
      },
      files: [formsFile],
      limitations: workflowLimitations,
    },
    {
      id: "guide.button.loading",
      name: buttonName,
      aliases: unique([buttonName, ...buttonHeadings]),
      summary: summaryFromDocument(button.document, buttonName),
      kind: "component-guidance",
      document: button.document,
      recipeManifest: null,
      sourcePaths: [BUTTON_DOCUMENT_PATH, buttonPreviewPath],
      componentNames: ["Button"],
      packageNames: ["@salt-ds/core"],
      attach: {
        componentNames: ["Button"],
        patternNames: [],
        pageSourcePaths: [BUTTON_DOCUMENT_PATH],
      },
      files: [buttonFile],
      limitations: buttonLimitations,
    },
  ];
}
