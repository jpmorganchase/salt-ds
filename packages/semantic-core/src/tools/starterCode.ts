import {
  buildThemeAppStarterCode,
  DEFAULT_NEW_WORK_THEME_PRESET_ID,
} from "../themePresets.js";
import type { ComponentRecord, PageRecord } from "../types.js";
import { inferComponentCapabilities } from "./consumerSignals.js";

export interface StarterCodeSnippet {
  label: string;
  language: "tsx" | "css";
  code: string;
  notes?: string[];
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

interface ComponentStarterShape {
  jsxLines: string[];
  importNames: string[];
  notes: string[];
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
    snippets.push({
      label: `${example.title} example`,
      language: "tsx",
      code: example.code,
      notes: [
        "Derived from the closest example currently attached to this component in the registry.",
        ...(example.source_url ? [`Source: ${example.source_url}`] : []),
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

export function createRecipeStarterCode(input: {
  recipeName: string;
  components: RecipeStarterComponent[];
  supporting_example?: SupportingStarterExample | null;
}): StarterCodeSnippet[] {
  if (input.components.length === 0) {
    return [];
  }

  const importMap = new Map<string, Set<string>>();
  for (const component of input.components) {
    addImport(
      importMap,
      component.package ?? "@salt-ds/core",
      getExportName(component.name),
    );
  }

  const body = input.components.flatMap((component) =>
    buildRecipeElement(component).map((line) => `      ${line}`),
  );

  const code = [
    ...toImportLines(importMap),
    "",
    "export function Example() {",
    "  return (",
    "    <>",
    ...body,
    "    </>",
    "  );",
    "}",
  ].join("\n");

  const snippets: StarterCodeSnippet[] = [
    {
      label: `${input.recipeName} starter`,
      language: "tsx",
      code,
      notes: [
        "Replace placeholder structure with the closest production example from the linked docs.",
      ],
    },
  ];

  if (input.supporting_example?.code.trim()) {
    snippets.push({
      label: `${input.supporting_example.title} example`,
      language: "tsx",
      code: input.supporting_example.code,
      notes: [
        "Derived from the closest example currently attached to this pattern or recipe.",
        ...(input.supporting_example.source_url
          ? [`Source: ${input.supporting_example.source_url}`]
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
