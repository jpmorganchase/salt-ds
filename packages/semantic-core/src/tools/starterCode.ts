import {
  buildThemeAppStarterCode,
  DEFAULT_NEW_WORK_THEME_PRESET_ID,
  getThemePreset,
} from "../themePresets.js";
import type { ComponentRecord, PageRecord } from "../types.js";
import { inferComponentCapabilities } from "./consumerSignals.js";

export interface StarterCodeSnippet {
  label: string;
  language: "tsx" | "css";
  code: string;
  notes?: string[];
  source_urls?: string[];
}

interface RecipeStarterComponent {
  name: string;
  package: string | null;
  role: string | null;
}

interface SupportingStarterExample {
  title: string;
  code: string;
  source_url: string | null;
}

interface PatternStarterScaffold {
  fidelity?: "canonical" | "hybrid" | "draft";
  source_urls?: string[];
  example_source_urls?: string[];
  semantics: {
    regions: string[];
    required_regions?: string[];
    optional_regions?: string[];
    build_around: string[];
    preserve_constraints: string[];
  };
  template?: {
    kind: "fallback-template";
    imports: Array<{
      name: string;
      package: string;
    }>;
    jsx_lines: string[];
    notes?: string[];
  };
}

interface ComponentStarterShape {
  jsxLines: string[];
  importNames: string[];
  notes: string[];
}

function shouldUseStructuredScaffold(
  scaffold: PatternStarterScaffold | null | undefined,
): scaffold is PatternStarterScaffold {
  if (!scaffold) {
    return false;
  }

  return scaffold.fidelity !== "draft" && scaffold.semantics.regions.length > 0;
}

function toPascalCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getExportName(
  name: string,
  explicitExportName?: string | null,
): string {
  return explicitExportName?.trim() || toPascalCase(name);
}

function addImport(
  importMap: Map<string, Set<string>>,
  packageName: string,
  exportName: string,
): void {
  const current = importMap.get(packageName);
  if (current) {
    current.add(exportName);
    return;
  }

  importMap.set(packageName, new Set([exportName]));
}

function toImportLines(importMap: Map<string, Set<string>>): string[] {
  return [...importMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([packageName, exports]) => {
      const names = [...exports].sort((left, right) =>
        left.localeCompare(right),
      );
      return `import { ${names.join(", ")} } from "${packageName}";`;
    });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasDefaultThemeBootstrapSignal(code: string): boolean {
  return (
    /\b(?:UNSTABLE_)?SaltProviderNext\b|\bSaltProvider\b/.test(code) ||
    /@salt-ds\/theme\/(?:index\.css|css\/theme-next\.css)/.test(code)
  );
}

function splitImportPreamble(code: string): {
  preamble: string;
  body: string;
} {
  const lines = code.split(/\r?\n/);
  let index = 0;
  let inImport = false;

  for (; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (inImport) {
      if (trimmed.endsWith(";")) {
        inImport = false;
      }
      continue;
    }

    if (trimmed === "") {
      continue;
    }

    if (trimmed.startsWith("import ")) {
      if (!trimmed.endsWith(";")) {
        inImport = true;
      }
      continue;
    }

    break;
  }

  return {
    preamble: lines.slice(0, index).join("\n"),
    body: lines.slice(index).join("\n"),
  };
}

function parseNamedImports(importedNames: string): string[] {
  return importedNames
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function renderNamedImport(
  importedNames: string[],
  multiline: boolean,
): string {
  if (!multiline && importedNames.length <= 4) {
    return `import { ${importedNames.join(", ")} } from "@salt-ds/core";`;
  }

  return [
    "import {",
    ...importedNames.map((name) => `  ${name},`),
    '} from "@salt-ds/core";',
  ].join("\n");
}

function rewriteSaltCoreProviderImports(input: {
  preamble: string;
  body: string;
  provider: string;
  needsProviderImport: boolean;
}): string {
  let hasCoreImport = false;
  let hasProviderImport = false;
  const bodyUsesThemeHook = /\buseTheme\b/.test(input.body);
  const bodyUsesProviderAlias = /<Provider(?=[\s>])/.test(input.body);
  const bodyUsesLegacyProviderIdentifier = /\bSaltProvider\b(?!Next)/.test(
    input.body,
  );
  const bodyUsesStableNextProviderIdentifier = /\bSaltProviderNext\b/.test(
    input.body,
  );
  const bodyUsesUnstableNextProviderIdentifier =
    /\bUNSTABLE_SaltProviderNext\b/.test(input.body);

  const rewritten = input.preamble.replace(
    /import\s+\{([\s\S]*?)\}\s+from\s+["']@salt-ds\/core["'];?/g,
    (match, importedNames: string) => {
      hasCoreImport = true;
      const names = parseNamedImports(importedNames).filter((name) => {
        if (name === "SaltProvider" && !bodyUsesLegacyProviderIdentifier) {
          return false;
        }

        if (
          name === "SaltProviderNext" &&
          !bodyUsesStableNextProviderIdentifier
        ) {
          return false;
        }

        if (
          name === "UNSTABLE_SaltProviderNext" &&
          !bodyUsesUnstableNextProviderIdentifier
        ) {
          return false;
        }

        if (name === "useTheme" && !bodyUsesThemeHook) {
          return false;
        }

        return true;
      });

      if (input.needsProviderImport || bodyUsesProviderAlias) {
        names.push(input.provider);
        hasProviderImport = true;
      }

      const uniqueNames = [...new Set(names)].sort((left, right) =>
        left.localeCompare(right),
      );
      if (uniqueNames.length === 0) {
        return "";
      }

      return renderNamedImport(uniqueNames, match.includes("\n"));
    },
  );

  if (
    input.needsProviderImport &&
    (!hasCoreImport || !hasProviderImport) &&
    !new RegExp(
      `import\\s+\\{[^}]*\\b${escapeRegExp(input.provider)}\\b[^}]*\\}\\s+from\\s+["']@salt-ds/core["']`,
      "m",
    ).test(rewritten)
  ) {
    return [
      `import { ${input.provider} } from "@salt-ds/core";`,
      rewritten.trimStart(),
    ]
      .filter(Boolean)
      .join("\n");
  }

  return rewritten;
}

function removeThemeSideEffectImports(preamble: string): string {
  return preamble
    .split(/\r?\n/)
    .filter(
      (line) =>
        !/^import\s+["']@salt-ds\/theme\/(?:index\.css|css\/theme-next\.css)["'];?\s*$/.test(
          line.trim(),
        ),
    )
    .join("\n");
}

function ensureThemeSideEffectImports(
  preamble: string,
  importPaths: string[],
): string {
  const lines = preamble
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, allLines) => {
      if (line.trim() !== "") {
        return true;
      }

      return index > 0 && index < allLines.length - 1;
    });

  for (const importPath of importPaths) {
    const importLine = `import "${importPath}";`;
    if (!lines.includes(importLine)) {
      lines.push(importLine);
    }
  }

  return lines.join("\n");
}

function removeDefaultThemePropAssignments(
  attributes: string,
  propNames: string[],
): string {
  let updated = attributes;

  for (const propName of propNames) {
    updated = updated.replace(
      new RegExp(
        `\\s+${escapeRegExp(propName)}\\s*=\\s*(?:"[^"]*"|'[^']*'|\\{[\\s\\S]*?\\})`,
        "g",
      ),
      "",
    );
  }

  return updated.trim();
}

function renderDefaultThemeProviderOpening(input: {
  indent: string;
  provider: string;
  defaultProps: Array<{ name: string; value: string }>;
  preservedAttributes: string;
  selfClosing: boolean;
}): string {
  const preservedAttributeLines = input.preservedAttributes
    ? input.preservedAttributes
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  if (input.defaultProps.length === 0 && preservedAttributeLines.length === 0) {
    return input.selfClosing
      ? `${input.indent}<${input.provider} />`
      : `${input.indent}<${input.provider}>`;
  }

  return [
    `${input.indent}<${input.provider}`,
    ...input.defaultProps.map(
      (prop) => `${input.indent}  ${prop.name}="${prop.value}"`,
    ),
    ...preservedAttributeLines.map((line) => `${input.indent}  ${line}`),
    input.selfClosing ? `${input.indent}/>` : `${input.indent}>`,
  ].join("\n");
}

function rewriteProviderTagsToDefaultTheme(code: string): string {
  const defaultThemePreset = getThemePreset(DEFAULT_NEW_WORK_THEME_PRESET_ID);
  const providerNames = [
    "SaltProvider",
    "SaltProviderNext",
    "UNSTABLE_SaltProviderNext",
  ];
  const providerPattern = providerNames.map(escapeRegExp).join("|");
  const propNames = defaultThemePreset.props.map((prop) => prop.name);
  const dynamicProviderAliasPattern =
    /\n\s*const\s+\{\s*themeNext\s*\}\s*=\s*useTheme\(\);\s*\n\s*const\s+Provider\s*=\s*themeNext\s*\?\s*SaltProviderNext\s*:\s*SaltProvider;\s*/g;
  const hasDynamicProviderAlias = dynamicProviderAliasPattern.test(code);

  let updated = code.replace(dynamicProviderAliasPattern, "\n");

  if (hasDynamicProviderAlias) {
    updated = updated
      .replace(/<Provider(?=[\s>])/g, `<${defaultThemePreset.provider}`)
      .replace(/<\/Provider>/g, `</${defaultThemePreset.provider}>`);
  }

  updated = updated.replace(
    new RegExp(`^(\\s*)<(${providerPattern})\\b([\\s\\S]*?)>`, "gm"),
    (_match, indent: string, _providerName: string, attributes: string) => {
      const trimmedAttributes = attributes.trim();
      const selfClosing = trimmedAttributes.endsWith("/");
      const attributesWithoutSelfClosing = selfClosing
        ? trimmedAttributes.slice(0, -1)
        : attributes;
      const preservedAttributes = removeDefaultThemePropAssignments(
        attributesWithoutSelfClosing,
        propNames,
      );

      return renderDefaultThemeProviderOpening({
        indent,
        provider: defaultThemePreset.provider,
        defaultProps: defaultThemePreset.props,
        preservedAttributes,
        selfClosing,
      });
    },
  );

  return updated.replace(
    new RegExp(`</(?:${providerPattern})>`, "g"),
    `</${defaultThemePreset.provider}>`,
  );
}

function normalizeDefaultThemeStarterCode(code: string): string {
  if (!hasDefaultThemeBootstrapSignal(code)) {
    return code;
  }

  const defaultThemePreset = getThemePreset(DEFAULT_NEW_WORK_THEME_PRESET_ID);
  const rewrittenBody = rewriteProviderTagsToDefaultTheme(code);
  const hasProviderTag = new RegExp(
    `<${escapeRegExp(defaultThemePreset.provider)}(?=[\\s>])`,
  ).test(rewrittenBody);
  const hasThemeCssImport =
    /@salt-ds\/theme\/(?:index\.css|css\/theme-next\.css)/.test(code);

  if (!hasProviderTag && !hasThemeCssImport) {
    return rewrittenBody;
  }

  const { preamble, body } = splitImportPreamble(rewrittenBody);
  const coreImports = rewriteSaltCoreProviderImports({
    preamble: removeThemeSideEffectImports(preamble),
    body,
    provider: defaultThemePreset.provider,
    needsProviderImport: hasProviderTag,
  });
  const importBlock = ensureThemeSideEffectImports(
    coreImports,
    defaultThemePreset.imports,
  );

  return [importBlock, body.trimStart()].filter(Boolean).join("\n\n");
}

function getComponentCategories(component: ComponentRecord): Set<string> {
  return new Set([
    ...(component.semantics?.category ?? []),
    ...component.category,
  ]);
}

function getComponentPropNames(component: ComponentRecord): Set<string> {
  return new Set(component.props.map((prop) => prop.name.trim().toLowerCase()));
}

function componentAllowsValue(
  component: ComponentRecord,
  propName: string,
  value: string,
): boolean {
  const prop = component.props.find(
    (entry) => entry.name.toLowerCase() === propName.toLowerCase(),
  );
  return (prop?.allowed_values ?? []).some(
    (allowed) => String(allowed).toLowerCase() === value.toLowerCase(),
  );
}

function shouldWrapInFormField(
  component: ComponentRecord,
  exportName: string,
  capabilities: string[],
): boolean {
  const categories = getComponentCategories(component);
  const propNames = getComponentPropNames(component);

  return (
    exportName !== "FormField" &&
    capabilities.includes("form-field") &&
    (categories.has("inputs") ||
      categories.has("selection-controls") ||
      propNames.has("validationstatus") ||
      /field|input|select|picker|slider|rating|checkbox|radio|switch/i.test(
        component.summary,
      ))
  );
}

function buildElementLine(
  exportName: string,
  attributes: string[],
  children: string | null,
): string {
  const attributeSuffix =
    attributes.length > 0 ? ` ${attributes.join(" ")}` : "";

  if (children) {
    return `<${exportName}${attributeSuffix}>${children}</${exportName}>`;
  }

  return `<${exportName}${attributeSuffix} />`;
}

function extractSimpleExampleStarter(
  component: ComponentRecord,
  exportName: string,
): ComponentStarterShape | null {
  const example = component.examples.find(
    (entry) => entry.code.trim().length > 0,
  );
  if (!example) {
    return null;
  }

  const code = example.code.trim();
  if (
    code.length === 0 ||
    /(^|\n)\s*(import|export)\s/m.test(code) ||
    !code.includes(`<${exportName}`)
  ) {
    return null;
  }

  const jsxTagNames = [...code.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map(
    (match) => match[1],
  );
  if (jsxTagNames.length === 0) {
    return null;
  }

  const importNames = [...new Set(jsxTagNames)];
  const unsupportedImports = importNames.filter(
    (name) => name !== exportName && name !== "FormField",
  );
  if (unsupportedImports.length > 0) {
    return null;
  }

  return {
    jsxLines: code.split(/\r?\n/),
    importNames: importNames.filter((name) => name !== exportName),
    notes: [
      "Starter shape derived from the closest attached Salt example.",
      ...(example.source_url ? [`Source: ${example.source_url}`] : []),
    ],
  };
}

function buildMetadataStarter(
  component: ComponentRecord,
  exportName: string,
  capabilities: string[],
): ComponentStarterShape {
  const categories = getComponentCategories(component);
  const propNames = getComponentPropNames(component);
  const usageText = [
    ...component.when_to_use,
    ...component.when_not_to_use,
    component.summary,
  ]
    .join(" ")
    .toLowerCase();
  const notes: string[] = [];
  const attributes: string[] = [];
  let children: string | null = null;

  const structuredNavigation =
    categories.has("navigation") &&
    /sidebar|vertical navigation|structured navigation|hierarchical|app-level|app shell|navigation region/.test(
      usageText,
    );

  if (structuredNavigation) {
    attributes.push('aria-label="Main navigation"');
  } else if (
    propNames.has("href") ||
    propNames.has("to") ||
    (categories.has("navigation") && !categories.has("layouts"))
  ) {
    if (propNames.has("to") && !propNames.has("href")) {
      attributes.push('to="/next"');
    } else {
      attributes.push('href="/next"');
    }
    children = "Go to next page";
  } else if (categories.has("actions")) {
    if (componentAllowsValue(component, "appearance", "solid")) {
      attributes.push('appearance="solid"');
    }
    children = "Primary action";
  } else if (
    categories.has("inputs") ||
    categories.has("selection-controls") ||
    capabilities.includes("form-field")
  ) {
    attributes.push(`aria-label="${component.name}"`);
  } else if (
    /accessible name|label/.test(
      [
        ...component.accessibility.summary,
        ...component.accessibility.rules.map((rule) => rule.rule),
      ]
        .join(" ")
        .toLowerCase(),
    )
  ) {
    attributes.push(`aria-label="${component.name}"`);
  }

  if (shouldWrapInFormField(component, exportName, capabilities)) {
    notes.push(
      "Wrap the control with FormField when you need a label, helper text, or validation messaging.",
    );
    return {
      importNames: ["FormField"],
      jsxLines: [
        `<FormField label="${component.name}">`,
        `  ${buildElementLine(exportName, attributes, children)}`,
        "</FormField>",
      ],
      notes,
    };
  }

  return {
    importNames: [],
    jsxLines: [buildElementLine(exportName, attributes, children)],
    notes,
  };
}

export function createComponentStarterCode(
  component: ComponentRecord,
): StarterCodeSnippet[] {
  const exportName = getExportName(
    component.name,
    component.source.export_name,
  );
  const capabilities = inferComponentCapabilities(component);
  const importMap = new Map<string, Set<string>>();
  addImport(importMap, component.package.name, exportName);
  const starterShape =
    extractSimpleExampleStarter(component, exportName) ??
    buildMetadataStarter(component, exportName, capabilities);
  const notes = [...starterShape.notes];
  const jsxLines = starterShape.jsxLines;

  for (const importName of starterShape.importNames) {
    addImport(importMap, "@salt-ds/core", importName);
  }

  if (component.status !== "stable") {
    notes.push(
      `${component.name} is ${component.status}; confirm that status is acceptable before shipping.`,
    );
  }

  if (!capabilities.includes("accessibility-guidance")) {
    notes.push(
      "Check the related docs for labeling and keyboard expectations before using this pattern in production.",
    );
  }

  const code = [
    ...toImportLines(importMap),
    "",
    "export function Example() {",
    "  return (",
    ...jsxLines.map((line) => `    ${line}`),
    "  );",
    "}",
  ].join("\n");

  const snippets: StarterCodeSnippet[] = [
    {
      label: `${component.name} starter`,
      language: "tsx",
      code,
      ...(notes.length > 0 ? { notes } : {}),
    },
  ];

  const example = component.examples.find(
    (entry) => entry.code.trim().length > 0,
  );
  if (example) {
    const normalizedExampleCode = normalizeDefaultThemeStarterCode(
      example.code,
    );
    snippets.push({
      label: `${example.title} example`,
      language: "tsx",
      code: normalizedExampleCode,
      notes: [
        "Derived from the closest example currently attached to this component in the registry.",
        ...(example.source_url ? [`Source: ${example.source_url}`] : []),
        ...(normalizedExampleCode !== example.code
          ? [
              "Theme bootstrap normalized to the recommended JPM Brand setup for new Salt work.",
            ]
          : []),
      ],
    });
  }

  return snippets;
}

function buildRecipeElement(component: RecipeStarterComponent): string[] {
  const exportName = getExportName(component.name);
  const roleLabel = component.role?.trim() || component.name.toLowerCase();
  const roleText = roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1);
  const attributes: string[] = [];
  let children: string | null = null;

  if (/navigation|link/i.test(roleLabel) || exportName === "Link") {
    attributes.push('href="/next"');
    children = "Go to next page";
  } else if (/primary|action|command/i.test(roleLabel)) {
    children = roleLabel.toLowerCase().includes("primary")
      ? "Primary action"
      : roleText;
  }

  return [
    `{/* ${roleLabel} */}`,
    buildElementLine(exportName, attributes, children),
  ];
}

function hasUsableSupportingExample(
  example: SupportingStarterExample | null | undefined,
): example is SupportingStarterExample {
  const code = example?.code.trim() ?? "";
  if (!code) {
    return false;
  }

  if (code.startsWith("// See ") || code.startsWith("// Linked resource:")) {
    return false;
  }

  return (
    code.includes("import ") ||
    code.includes("export ") ||
    code.includes("return (") ||
    code.includes("<")
  );
}

export function createRecipeStarterCode(input: {
  recipeName: string;
  components: RecipeStarterComponent[];
  supporting_example?: SupportingStarterExample | null;
  starter_scaffold?: PatternStarterScaffold | null;
}): StarterCodeSnippet[] {
  const structuredScaffold = shouldUseStructuredScaffold(input.starter_scaffold)
    ? input.starter_scaffold
    : null;
  const exampleBackedStarter = hasUsableSupportingExample(
    input.supporting_example,
  )
    ? input.supporting_example
    : null;
  const fallbackTemplate =
    structuredScaffold?.template?.kind === "fallback-template"
      ? structuredScaffold.template
      : null;

  if (input.components.length === 0 && !structuredScaffold) {
    return [];
  }

  const importMap = new Map<string, Set<string>>();
  if (fallbackTemplate) {
    for (const imported of fallbackTemplate.imports) {
      addImport(importMap, imported.package, imported.name);
    }
  } else {
    for (const component of input.components) {
      addImport(
        importMap,
        component.package ?? "@salt-ds/core",
        getExportName(component.name),
      );
    }
  }

  const defaultThemePreset = getThemePreset(DEFAULT_NEW_WORK_THEME_PRESET_ID);
  addImport(importMap, "@salt-ds/core", defaultThemePreset.provider);

  const structuredFallbackLines = fallbackTemplate?.jsx_lines ?? [];
  const body = structuredScaffold
    ? structuredFallbackLines.length > 0
      ? structuredFallbackLines.map((line) => `      ${line}`)
      : input.components.flatMap((component) =>
          buildRecipeElement(component).map((line) => `      ${line}`),
        )
    : input.components.flatMap((component) =>
        buildRecipeElement(component).map((line) => `      ${line}`),
      );

  const normalizedExampleBackedStarterCode = exampleBackedStarter
    ? normalizeDefaultThemeStarterCode(exampleBackedStarter.code)
    : null;
  const code = normalizedExampleBackedStarterCode
    ? normalizedExampleBackedStarterCode
    : [
        ...toImportLines(importMap),
        ...defaultThemePreset.imports.map(
          (importPath) => `import "${importPath}";`,
        ),
        "",
        "export function Example() {",
        "  return (",
        `    <${defaultThemePreset.provider}`,
        ...defaultThemePreset.props.map(
          (prop) => `      ${prop.name}="${prop.value}"`,
        ),
        "    >",
        "      <>",
        ...body,
        "      </>",
        `    </${defaultThemePreset.provider}>`,
        "  );",
        "}",
      ].join("\n");

  const snippets: StarterCodeSnippet[] = [
    {
      label: `${input.recipeName} starter`,
      language: "tsx",
      code,
      source_urls: [
        ...(structuredScaffold?.source_urls ?? []),
        ...(structuredScaffold?.example_source_urls ?? []),
      ],
      notes: [
        ...(structuredScaffold?.source_urls?.length
          ? [
              `Canonical scaffold sources: ${structuredScaffold.source_urls.join(", ")}`,
            ]
          : []),
        ...(structuredScaffold?.example_source_urls?.length
          ? [
              `Supporting example sources: ${structuredScaffold.example_source_urls.join(", ")}`,
            ]
          : []),
        ...(structuredScaffold?.semantics.build_around?.length
          ? [
              `Build around: ${structuredScaffold.semantics.build_around.join("; ")}`,
            ]
          : []),
        ...(structuredScaffold?.semantics.preserve_constraints?.length
          ? [
              `Preserve constraints: ${structuredScaffold.semantics.preserve_constraints.join("; ")}`,
            ]
          : []),
        ...(structuredScaffold?.semantics.required_regions?.length
          ? [
              `Required scaffold regions: ${structuredScaffold.semantics.required_regions.join(", ")}`,
            ]
          : []),
        ...(structuredScaffold?.semantics.optional_regions?.length
          ? [
              `Optional scaffold regions: ${structuredScaffold.semantics.optional_regions.join(", ")}`,
            ]
          : []),
        ...(fallbackTemplate
          ? [
              structuredScaffold?.fidelity === "hybrid"
                ? "Hybrid scaffold semantics were derived from docs/examples, but the fallback template is still hand-authored for implementation speed. Treat the linked docs as the source of truth."
                : "Fallback template included for implementation speed. Treat the canonical scaffold fields and linked docs as the source of truth.",
              "Replace placeholder structure with the closest production example from the linked docs.",
            ]
          : []),
        ...(exampleBackedStarter
          ? [
              "Starter code is based on the closest extracted pattern story example rather than a private fallback template.",
              ...(normalizedExampleBackedStarterCode !==
              exampleBackedStarter.code
                ? [
                    "Theme bootstrap normalized to the recommended JPM Brand setup for new Salt work.",
                  ]
                : []),
            ]
          : []),
        "Use the recommended JPM Brand theme bootstrap for new Salt work. Only fall back to legacy SaltProvider when migration compatibility or repo policy explicitly requires it.",
        ...(fallbackTemplate?.notes ?? []),
        ...(input.starter_scaffold && !structuredScaffold
          ? [
              "This pattern currently falls back to generic starter composition because the attached scaffold is still draft quality.",
            ]
          : []),
      ],
    },
  ];

  if (
    input.supporting_example?.code.trim() &&
    (!exampleBackedStarter ||
      input.supporting_example.code !== exampleBackedStarter.code)
  ) {
    const normalizedSupportingExampleCode = normalizeDefaultThemeStarterCode(
      input.supporting_example.code,
    );
    snippets.push({
      label: `${input.supporting_example.title} example`,
      language: "tsx",
      code: normalizedSupportingExampleCode,
      notes: [
        "Derived from the closest example currently attached to this pattern or recipe.",
        ...(input.supporting_example.source_url
          ? [`Source: ${input.supporting_example.source_url}`]
          : []),
        ...(normalizedSupportingExampleCode !== input.supporting_example.code
          ? [
              "Theme bootstrap normalized to the recommended JPM Brand setup for new Salt work.",
            ]
          : []),
      ],
    });
  }

  return snippets;
}

export function createFoundationStarterCode(
  page: PageRecord,
): StarterCodeSnippet[] {
  const normalizedTitle = page.title.toLowerCase();

  if (normalizedTitle.includes("typography")) {
    return [
      {
        label: `${page.title} starter`,
        language: "tsx",
        code: [
          'import { Text } from "@salt-ds/core";',
          "",
          "export function Example() {",
          "  return (",
          "    <section>",
          "      <Text>{/* Section label */}Account overview</Text>",
          "      <Text>{/* Page title */}Portfolio summary</Text>",
          "      <Text>{/* Supporting copy */}Keep text hierarchy inside the Salt type scale.</Text>",
          "    </section>",
          "  );",
          "}",
        ].join("\n"),
        notes: [
          "Use Salt text primitives instead of hard-coded font sizes for hierarchy.",
        ],
      },
    ];
  }

  if (normalizedTitle.includes("spacing")) {
    return [
      {
        label: `${page.title} starter`,
        language: "css",
        code: [
          ".pageSection {",
          "  display: grid;",
          "  gap: var(--salt-spacing-300);",
          "  padding: var(--salt-spacing-300);",
          "}",
        ].join("\n"),
      },
    ];
  }

  if (normalizedTitle.includes("responsive")) {
    return [
      {
        label: `${page.title} starter`,
        language: "css",
        code: [
          ".pageRegion {",
          "  display: grid;",
          "  gap: var(--salt-spacing-300);",
          "}",
          "",
          "@media (max-width: 959px) {",
          "  .pageRegion {",
          "    gap: var(--salt-spacing-200);",
          "  }",
          "}",
        ].join("\n"),
      },
    ];
  }

  if (normalizedTitle.includes("density") || normalizedTitle.includes("size")) {
    return [
      {
        label: `${page.title} starter`,
        language: "tsx",
        code: buildThemeAppStarterCode(DEFAULT_NEW_WORK_THEME_PRESET_ID, {
          additionalProps: [{ name: "density", value: "medium" }],
        }),
        notes: [
          "Use the recommended JPM Brand theme bootstrap for new work, then layer density or size choices on top.",
        ],
      },
    ];
  }

  return [
    {
      label: `${page.title} starter`,
      language: "css",
      code: [
        ".pageRegion {",
        "  display: grid;",
        "  gap: var(--salt-spacing-300);",
        "  padding: var(--salt-spacing-300);",
        "}",
      ].join("\n"),
      notes: [
        "Use Salt spacing, size, and density tokens instead of hard-coded layout values.",
      ],
    },
  ];
}
