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

const ANALYTICAL_DASHBOARD_DOCUMENT_PATH =
  "site/docs/patterns/analytical-dashboard.mdx";
const NAVIGATION_DOCUMENT_PATH = "site/docs/patterns/navigation.mdx";
const CONTENT_STATUS_DOCUMENT_PATH = "site/docs/patterns/content-status.mdx";
const FORMS_DOCUMENT_PATH = "site/docs/patterns/forms.mdx";
const BUTTON_DOCUMENT_PATH = "site/docs/components/button/examples.mdx";
const CHOOSING_PRIMITIVE_DOCUMENT_PATH =
  "site/docs/getting-started/choosing-the-right-primitive.mdx";
const COMPOSITION_PITFALLS_DOCUMENT_PATH =
  "site/docs/getting-started/composition-pitfalls.mdx";
const DIALOG_USAGE_DOCUMENT_PATH = "site/docs/components/dialog/usage.mdx";
const DIALOG_EXAMPLES_DOCUMENT_PATH =
  "site/docs/components/dialog/examples.mdx";
const DIALOG_ACCESSIBILITY_DOCUMENT_PATH =
  "site/docs/components/dialog/accessibility.mdx";
const BUTTON_BAR_DOCUMENT_PATH = "site/docs/patterns/button-bar.mdx";
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
    id: "forms.cancellation-and-drafts",
    heading_path: ["How to build", "Cancellation and drafts"],
    include_descendants: true,
    semantic_role: "behavior",
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
  {
    id: "forms.full-page",
    heading_path: ["Full page"],
    include_descendants: false,
    semantic_role: "decision",
    qualification_group: "forms.surface",
  },
  {
    id: "forms.overlay",
    heading_path: ["Overlay (dialog/drawer)"],
    include_descendants: false,
    semantic_role: "decision",
    qualification_group: "forms.surface",
  },
  {
    id: "forms.top-down-reading-order",
    heading_path: [
      "How to build",
      "Multiple columns",
      "Top down reading order",
    ],
    include_descendants: false,
    semantic_role: "constraint",
  },
];

const ANALYTICAL_DASHBOARD_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  { id: "dashboard.overview", heading_path: [], include_descendants: false },
  {
    id: "dashboard.when-to-use",
    heading_path: ["When to use"],
    include_descendants: false,
  },
  {
    id: "dashboard.when-not-to-use",
    heading_path: ["When not to use"],
    include_descendants: false,
  },
  {
    id: "dashboard.how-to-build",
    heading_path: ["How to build"],
    include_descendants: false,
  },
  {
    id: "dashboard.anatomy",
    heading_path: ["How to build", "Anatomy"],
    include_descendants: false,
  },
  {
    id: "dashboard.layout",
    heading_path: ["How to build", "Dashboard layout"],
    include_descendants: false,
  },
];

const NAVIGATION_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  { id: "navigation.overview", heading_path: [], include_descendants: false },
  {
    id: "navigation.when-to-use",
    heading_path: ["When to use"],
    include_descendants: false,
  },
  {
    id: "navigation.when-not-to-use",
    heading_path: ["When not to use"],
    include_descendants: false,
  },
  {
    id: "navigation.how-to-build",
    heading_path: ["How to build"],
    include_descendants: false,
  },
  {
    id: "navigation.anatomy",
    heading_path: ["How to build", "Anatomy"],
    include_descendants: false,
  },
];

const CONTENT_STATUS_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "content-status.overview",
    heading_path: [],
    include_descendants: false,
  },
  {
    id: "content-status.when-to-use",
    heading_path: ["When to use"],
    include_descendants: false,
  },
  {
    id: "content-status.when-not-to-use",
    heading_path: ["When not to use"],
    include_descendants: false,
  },
  {
    id: "content-status.how-to-build",
    heading_path: ["How to build"],
    include_descendants: false,
  },
  {
    id: "content-status.loading-and-recovery",
    heading_path: [
      "How to build",
      "Choosing how to communicate loading and recovery",
    ],
    include_descendants: true,
    semantic_role: "decision",
  },
  {
    id: "content-status.supporting-messages",
    heading_path: ["How to build", "Supporting messages"],
    include_descendants: false,
  },
];

const CHOOSING_PRIMITIVE_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  { id: "primitive.overview", heading_path: [], include_descendants: false },
  {
    id: "primitive.start-with-intent",
    heading_path: ["Start with user intent"],
    include_descendants: false,
  },
  {
    id: "primitive.component-or-pattern",
    heading_path: ["Common decisions", "Component or pattern"],
    include_descendants: false,
  },
];

const COMPOSITION_PITFALLS_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "composition.overview",
    heading_path: [],
    include_descendants: false,
  },
  {
    id: "composition.recreating-primitives",
    heading_path: ["Pitfalls to avoid", "Recreating standard Salt primitives"],
    include_descendants: false,
  },
];

const BUTTON_LOADING_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "button.loading",
    heading_path: ["Loading"],
    include_descendants: true,
  },
];

const DIALOG_USAGE_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "dialog.using",
    heading_path: ["Using the component"],
    include_descendants: false,
    semantic_role: "use-condition",
    qualification_group: "forms.surface",
  },
  {
    id: "dialog.using.when-to-use",
    heading_path: ["Using the component", "When to use"],
    include_descendants: false,
    semantic_role: "use-condition",
    qualification_group: "forms.surface",
  },
  {
    id: "dialog.using.when-not-to-use",
    heading_path: ["Using the component", "When not to use"],
    include_descendants: false,
    semantic_role: "exclusion",
    qualification_group: "forms.surface",
  },
  {
    id: "dialog.using.forms-in-dialogs",
    heading_path: ["Using the component", "Forms in dialogs"],
    include_descendants: false,
    semantic_role: "behavior",
    qualification_group: "dialog.forms",
  },
  {
    id: "dialog.using.action-composition",
    heading_path: ["Using the component", "Action composition"],
    include_descendants: false,
    semantic_role: "composition",
    qualification_group: "dialog.actions",
  },
];
const DIALOG_EXAMPLES_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "dialog.default",
    heading_path: ["Default"],
    include_descendants: false,
    semantic_role: "composition",
  },
  {
    id: "dialog.sizes",
    heading_path: ["Sizes"],
    include_descendants: true,
    semantic_role: "constraint",
  },
];
const DIALOG_ACCESSIBILITY_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "dialog.focus",
    heading_path: ["Best practices", "Focus"],
    include_descendants: false,
    semantic_role: "accessibility",
    qualification_group: "dialog.focus",
  },
  {
    id: "dialog.initial-focus",
    heading_path: ["Best practices", "Initial focus"],
    include_descendants: false,
    semantic_role: "accessibility",
    qualification_group: "dialog.focus",
  },
  {
    id: "dialog.focus-sequence",
    heading_path: ["Best practices", "Focus sequence"],
    include_descendants: false,
    semantic_role: "accessibility",
    qualification_group: "dialog.focus",
  },
];
const BUTTON_BAR_SELECTORS: readonly SelectedMdxSectionSelector[] = [
  {
    id: "button-bar.layout",
    heading_path: ["How to build", "Layout"],
    include_descendants: false,
    semantic_role: "composition",
    qualification_group: "button-bar.dialog-actions",
  },
  {
    id: "button-bar.dialog-order",
    heading_path: ["Button order", "Dialog"],
    include_descendants: false,
    semantic_role: "composition",
    qualification_group: "button-bar.dialog-actions",
  },
  {
    id: "button-bar.stacked",
    heading_path: ["Stacked button bar"],
    include_descendants: false,
    semantic_role: "constraint",
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
  /** Authored recipe facts that are not part of the selected MDX. */
  keywords?: string[];
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

function requireSupportedDocument(document: DocumentModel): void {
  if (document.diagnostics.length === 0) return;
  const diagnostic = document
    .diagnostics[0] as DocumentModel["diagnostics"][number];
  throw new Error(
    `Selected guidance source ${document.source.source_path}:${diagnostic.range.start_line} ${diagnostic.code}: ${diagnostic.message}`,
  );
}

function mergeWorkflowDocuments(
  documents: readonly ParsedSelectedDocument[],
): DocumentModel {
  for (const parsed of documents) requireSupportedDocument(parsed.document);
  const primary = documents[0];
  if (!primary)
    throw new Error("Workflow guidance requires a primary document.");
  const seen = new Set<string>();
  const sections = documents.flatMap(({ document }) =>
    document.sections.map((section) => {
      const id = section.id;
      if (seen.has(id)) {
        throw new Error(`Workflow guidance section id is duplicated: ${id}.`);
      }
      seen.add(id);
      return { ...section, source: section.source ?? document.source };
    }),
  );
  return {
    contract: "salt-document/1",
    source: primary.document.source,
    sections,
    diagnostics: [],
  };
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

  const canonicalGuidance = recipe.source.canonical_guidance;
  const requiredGuidance = [
    ANALYTICAL_DASHBOARD_DOCUMENT_PATH,
    NAVIGATION_DOCUMENT_PATH,
    CONTENT_STATUS_DOCUMENT_PATH,
    FORMS_DOCUMENT_PATH,
    `${BUTTON_DOCUMENT_PATH}#loading`,
    CHOOSING_PRIMITIVE_DOCUMENT_PATH,
    COMPOSITION_PITFALLS_DOCUMENT_PATH,
    DIALOG_USAGE_DOCUMENT_PATH,
    DIALOG_EXAMPLES_DOCUMENT_PATH,
    DIALOG_ACCESSIBILITY_DOCUMENT_PATH,
    BUTTON_BAR_DOCUMENT_PATH,
  ];
  if (
    canonicalGuidance.length !== requiredGuidance.length ||
    canonicalGuidance.some(
      (sourcePath, index) => sourcePath !== requiredGuidance[index],
    )
  ) {
    throw new Error(
      `Workflow recipe ${recipeSourcePath} must declare the ordered service-worklist guidance sources.`,
    );
  }

  const [
    analyticalDashboard,
    navigation,
    contentStatus,
    forms,
    button,
    choosingPrimitive,
    compositionPitfalls,
    dialogUsage,
    dialogExamples,
    dialogAccessibility,
    buttonBar,
  ] = await Promise.all([
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, ANALYTICAL_DASHBOARD_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/patterns/analytical-dashboard",
      selectors: ANALYTICAL_DASHBOARD_SELECTORS,
      fallbackTitle: "Analytical dashboard",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, NAVIGATION_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/patterns/navigation",
      selectors: NAVIGATION_SELECTORS,
      fallbackTitle: "Navigation",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, CONTENT_STATUS_DOCUMENT_PATH),
      documentId: "guide.content-status",
      route: "/salt/patterns/content-status",
      selectors: CONTENT_STATUS_SELECTORS,
      fallbackTitle: "Content status",
    }),
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
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, CHOOSING_PRIMITIVE_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/getting-started/choosing-the-right-primitive",
      selectors: CHOOSING_PRIMITIVE_SELECTORS,
      fallbackTitle: "Choosing the right primitive",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, COMPOSITION_PITFALLS_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/getting-started/composition-pitfalls",
      selectors: COMPOSITION_PITFALLS_SELECTORS,
      fallbackTitle: "Composition pitfalls",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, DIALOG_USAGE_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/components/dialog/usage",
      selectors: DIALOG_USAGE_SELECTORS,
      fallbackTitle: "Dialog",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, DIALOG_EXAMPLES_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/components/dialog/examples",
      selectors: DIALOG_EXAMPLES_SELECTORS,
      fallbackTitle: "Dialog",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, DIALOG_ACCESSIBILITY_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/components/dialog/accessibility",
      selectors: DIALOG_ACCESSIBILITY_SELECTORS,
      fallbackTitle: "Dialog",
    }),
    parseSelectedDocument({
      sourceRoot: input.sourceRoot,
      declared,
      sourcePath: assertDeclared(declared, BUTTON_BAR_DOCUMENT_PATH),
      documentId: recipe.id,
      route: "/salt/patterns/button-bar",
      selectors: BUTTON_BAR_SELECTORS,
      fallbackTitle: "Button bar",
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
  const reusablePaths = recipe.source.reusable_workflow_files.map(
    (sourcePath) =>
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
  requireSupportedDocument(contentStatus.document);
  const workflowDocument = mergeWorkflowDocuments([
    analyticalDashboard,
    navigation,
    forms,
    choosingPrimitive,
    compositionPitfalls,
    dialogUsage,
    dialogExamples,
    dialogAccessibility,
    buttonBar,
  ]);
  const buttonLimitations = diagnosticsLimitations(button.document, buttonName);
  const workflowSourcePaths = unique([
    ANALYTICAL_DASHBOARD_DOCUMENT_PATH,
    NAVIGATION_DOCUMENT_PATH,
    FORMS_DOCUMENT_PATH,
    CHOOSING_PRIMITIVE_DOCUMENT_PATH,
    COMPOSITION_PITFALLS_DOCUMENT_PATH,
    DIALOG_USAGE_DOCUMENT_PATH,
    DIALOG_EXAMPLES_DOCUMENT_PATH,
    DIALOG_ACCESSIBILITY_DOCUMENT_PATH,
    BUTTON_BAR_DOCUMENT_PATH,
    recipeSourcePath,
    ...reusablePaths,
    packagePath,
    formsPreviewPath,
  ]);
  const workflowLimitations = [...recipe.limitations];

  return [
    {
      id: recipe.id,
      name: recipe.title,
      aliases: unique([recipe.title, ...recipe.intent.aliases]),
      summary: recipe.intent.summary,
      keywords: [
        ...Object.values(recipe.adaptation).flat(),
        ...recipe.acceptance.automated,
        ...recipe.acceptance.manual_review_pending,
        ...recipe.limitations,
      ],
      kind: "workflow",
      document: workflowDocument,
      recipeManifest: manifestPath,
      sourcePaths: workflowSourcePaths,
      componentNames: [
        "Table",
        "Form field",
        "Input",
        "Banner",
        "Dialog",
        "Button",
        "Navigation item",
        "Card",
        "Panel",
        "Link",
      ],
      packageNames: packages,
      attach: {
        componentNames: [],
        patternNames: [
          analyticalDashboard.title,
          navigation.title,
          forms.title,
          "Metric",
        ],
        pageSourcePaths: [
          ANALYTICAL_DASHBOARD_DOCUMENT_PATH,
          NAVIGATION_DOCUMENT_PATH,
          FORMS_DOCUMENT_PATH,
          CHOOSING_PRIMITIVE_DOCUMENT_PATH,
          COMPOSITION_PITFALLS_DOCUMENT_PATH,
          DIALOG_USAGE_DOCUMENT_PATH,
          DIALOG_EXAMPLES_DOCUMENT_PATH,
          DIALOG_ACCESSIBILITY_DOCUMENT_PATH,
          BUTTON_BAR_DOCUMENT_PATH,
        ],
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
    {
      id: "guide.content-status",
      name: contentStatus.title,
      aliases: [contentStatus.title],
      summary: summaryFromDocument(contentStatus.document, contentStatus.title),
      kind: "component-guidance",
      document: contentStatus.document,
      recipeManifest: null,
      sourcePaths: [CONTENT_STATUS_DOCUMENT_PATH],
      componentNames: ["Banner"],
      packageNames: ["@salt-ds/core"],
      attach: {
        componentNames: ["Banner"],
        patternNames: [contentStatus.title],
        pageSourcePaths: [CONTENT_STATUS_DOCUMENT_PATH],
      },
      files: [],
      limitations: [],
    },
  ];
}
