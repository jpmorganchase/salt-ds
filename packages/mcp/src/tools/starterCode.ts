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

function shouldWrapInFormField(
  exportName: string,
  capabilities: string[],
): boolean {
  return (
    exportName !== "FormField" &&
    capabilities.includes("form-field") &&
    /(Input|Picker|Dropdown|Combo|Select|Slider|Rating|Checkbox|Radio|Switch)/i.test(
      exportName,
    )
  );
}

function buildLeafElement(
  exportName: string,
  label: string,
  role: string | null,
): string[] {
  if (exportName === "Link") {
    return [`<${exportName} href="/next">${label}</${exportName}>`];
  }

  if (exportName === "Button") {
    const text = role?.toLowerCase().includes("primary")
      ? "Primary action"
      : label;
    return [`<${exportName} appearance="solid">${text}</${exportName}>`];
  }

  if (/(Checkbox|Radio|Switch)/.test(exportName)) {
    return [`<${exportName} aria-label="${label}" />`];
  }

  if (/(Input|Picker|Dropdown|Combo|Select|Slider|Rating)/i.test(exportName)) {
    return [`<${exportName} aria-label="${label}" />`];
  }

  if (
    /(Dialog|Drawer|Overlay|Tooltip|Menu|Tabs|Table|Grid|Chart|Tree)/i.test(
      exportName,
    )
  ) {
    return [`<${exportName} />`];
  }

  return [`<${exportName} />`];
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
  const notes: string[] = [];
  let jsxLines = buildLeafElement(exportName, component.name, null);

  if (shouldWrapInFormField(exportName, capabilities)) {
    addImport(importMap, "@salt-ds/core", "FormField");
    jsxLines = [
      `<FormField label="${component.name}">`,
      `  ${buildLeafElement(exportName, component.name, null)[0]}`,
      "</FormField>",
    ];
    notes.push(
      "Wrap the control with FormField when you need a label, helper text, or validation messaging.",
    );
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
  const roleLabel =
    component.role?.trim() ||
    (exportName === "Button" ? "action" : component.name.toLowerCase());
  const roleText = roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1);

  return [
    `{/* ${roleLabel} */}`,
    ...buildLeafElement(exportName, roleText, component.role),
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
        code: [
          'import { SaltProvider } from "@salt-ds/core";',
          "",
          "export function Example() {",
          "  return (",
          '    <SaltProvider density="medium">',
          "      <section>{/* Salt content goes here */}</section>",
          "    </SaltProvider>",
          "  );",
          "}",
        ].join("\n"),
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
