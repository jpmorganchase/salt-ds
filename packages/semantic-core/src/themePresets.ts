export type ThemePresetId = "jpm-brand" | "legacy";

export interface ThemeProviderProp {
  name: string;
  value: string;
}

export interface ThemeFontSetup {
  title: string;
  language: "css";
  code: string;
  note?: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  summary: string;
  recommendedFor: string;
  provider: "SaltProvider" | "SaltProviderNext";
  imports: string[];
  props: ThemeProviderProp[];
  fontSetup?: ThemeFontSetup;
}

export const DEFAULT_NEW_WORK_THEME_PRESET_ID = "jpm-brand" as const;

const AMPLITUDE_FONT_FACE_SNIPPET = `@font-face {
  font-family: Amplitude;
  font-style: normal;
  font-weight: 300;
  src:
    local("Amplitude Light"),
    url("../public/fonts/amplitude-light.woff2") format("woff2");
}

@font-face {
  font-family: Amplitude;
  font-style: normal;
  font-weight: 400;
  src:
    local("Amplitude"),
    url("../public/fonts/amplitude-regular.woff2") format("woff2");
}

@font-face {
  font-family: Amplitude;
  font-style: normal;
  font-weight: 500;
  src:
    local("Amplitude Medium"),
    url("../public/fonts/amplitude-medium.woff2") format("woff2");
}

@font-face {
  font-family: Amplitude;
  font-style: normal;
  font-weight: 700;
  src:
    local("Amplitude Bold"),
    url("../public/fonts/amplitude-bold.woff2") format("woff2");
}`;

const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  "jpm-brand": {
    id: "jpm-brand",
    label: "JPM Brand theme",
    summary:
      "Default new-work visual style aligned to the JPMorgan brand and long-term Salt direction.",
    recommendedFor: "New Salt applications and long-term brand-aligned work.",
    provider: "SaltProviderNext",
    imports: ["@salt-ds/theme/index.css", "@salt-ds/theme/css/theme-next.css"],
    props: [
      { name: "accent", value: "teal" },
      { name: "corner", value: "rounded" },
      { name: "headingFont", value: "Amplitude" },
      { name: "actionFont", value: "Amplitude" },
    ],
    fontSetup: {
      title: "Amplitude font-face declarations",
      language: "css",
      code: AMPLITUDE_FONT_FACE_SNIPPET,
      note: 'Ensure the host app loads Amplitude when using headingFont="Amplitude" and actionFont="Amplitude".',
    },
  },
  legacy: {
    id: "legacy",
    label: "Legacy (UITK) theme",
    summary:
      "Compatibility theme for UITK migration work and staged transitions.",
    recommendedFor:
      "Migration work that must stay visually compatible with UITK during transition.",
    provider: "SaltProvider",
    imports: ["@salt-ds/theme/index.css"],
    props: [],
  },
};

function resolveThemePreset(input: ThemePresetId | ThemePreset): ThemePreset {
  return typeof input === "string" ? THEME_PRESETS[input] : input;
}

function mergeThemeProps(
  baseProps: ThemeProviderProp[],
  extraProps: ThemeProviderProp[] = [],
): ThemeProviderProp[] {
  const merged = new Map<string, ThemeProviderProp>();

  for (const prop of baseProps) {
    merged.set(prop.name, prop);
  }

  for (const prop of extraProps) {
    merged.set(prop.name, prop);
  }

  const extraPropNames = new Set(extraProps.map((prop) => prop.name));

  return [
    ...baseProps.filter((prop) => !extraPropNames.has(prop.name)),
    ...extraProps,
  ].map((prop) => merged.get(prop.name) ?? prop);
}

function renderProviderBlock(
  providerName: ThemePreset["provider"],
  props: ThemeProviderProp[],
  childLines: string[],
  input: {
    indent: string;
    childIndent: string;
    closingSuffix?: string;
  },
): string[] {
  const { indent, childIndent, closingSuffix = "" } = input;

  if (props.length === 0) {
    return [
      `${indent}<${providerName}>`,
      ...childLines.map((line) => `${childIndent}${line}`),
      `${indent}</${providerName}>${closingSuffix}`,
    ];
  }

  return [
    `${indent}<${providerName}`,
    ...props.map((prop) => `${indent}  ${prop.name}="${prop.value}"`),
    `${indent}>`,
    ...childLines.map((line) => `${childIndent}${line}`),
    `${indent}</${providerName}>${closingSuffix}`,
  ];
}

function quoteList(values: string[]): string {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return `"${values[0]}"`;
  }

  if (values.length === 2) {
    return `"${values[0]}" and "${values[1]}"`;
  }

  return `${values
    .slice(0, -1)
    .map((value) => `"${value}"`)
    .join(", ")}, and "${values.at(-1)}"`;
}

export function getThemePreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS[id];
}

export function listThemePresets(): ThemePreset[] {
  return Object.values(THEME_PRESETS);
}

export function formatThemePresetPropAssignments(
  input: ThemePresetId | ThemePreset,
): string {
  const preset = resolveThemePreset(input);

  return preset.props.map((prop) => `${prop.name}="${prop.value}"`).join(", ");
}

export function formatThemePresetImports(
  input: ThemePresetId | ThemePreset,
): string {
  return quoteList(resolveThemePreset(input).imports);
}

export function buildThemeSetupSnippet(
  input: ThemePresetId | ThemePreset,
  options?: {
    childLines?: string[];
    additionalProps?: ThemeProviderProp[];
  },
): string {
  const preset = resolveThemePreset(input);
  const childLines = options?.childLines ?? ["// ..."];
  const props = mergeThemeProps(preset.props, options?.additionalProps);

  return [
    `import { ${preset.provider} } from "@salt-ds/core";`,
    ...preset.imports.map((importPath) => `import "${importPath}";`),
    "",
    ...renderProviderBlock(preset.provider, props, childLines, {
      indent: "",
      childIndent: "  ",
      closingSuffix: ";",
    }),
  ].join("\n");
}

export function buildThemeAppStarterCode(
  input: ThemePresetId | ThemePreset,
  options?: {
    componentName?: string;
    childLines?: string[];
    additionalProps?: ThemeProviderProp[];
  },
): string {
  const preset = resolveThemePreset(input);
  const componentName = options?.componentName ?? "Example";
  const childLines = options?.childLines ?? [
    "<section>{/* Salt content goes here */}</section>",
  ];
  const props = mergeThemeProps(preset.props, options?.additionalProps);

  return [
    `import { ${preset.provider} } from "@salt-ds/core";`,
    ...preset.imports.map((importPath) => `import "${importPath}";`),
    "",
    `export function ${componentName}() {`,
    "  return (",
    ...renderProviderBlock(preset.provider, props, childLines, {
      indent: "    ",
      childIndent: "      ",
    }),
    "  );",
    "}",
  ].join("\n");
}
