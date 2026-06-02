export type ThemePresetId = "unsupported";

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
  status: "unsupported";
  missing: string[];
  evidence_ref_ids: string[];
  provider: null;
  imports: string[];
  props: ThemeProviderProp[];
  fontSetup?: ThemeFontSetup;
}

export const DEFAULT_NEW_WORK_THEME_PRESET_ID = "unsupported" as const;

const UNSUPPORTED_THEME_PRESET: ThemePreset = {
  id: DEFAULT_NEW_WORK_THEME_PRESET_ID,
  label: "Theme bootstrap unsupported",
  summary:
    "Provider, theme import, prop, and font bootstrap claims require source-backed evidence before generation.",
  recommendedFor:
    "Use only as an unsupported state when workflow evidence, registry-backed generated context, project policy, or explicit input has not supplied theme facts.",
  status: "unsupported",
  missing: [
    "provider name evidence",
    "theme import evidence",
    "provider prop evidence",
    "font setup evidence",
    "compatibility path evidence",
  ],
  evidence_ref_ids: [],
  provider: null,
  imports: [],
  props: [],
};

function resolveThemePreset(
  input: ThemePresetId | ThemePreset | string,
): ThemePreset {
  return typeof input === "string" ? UNSUPPORTED_THEME_PRESET : input;
}

export function getThemePreset(id: ThemePresetId | string): ThemePreset {
  return resolveThemePreset(id);
}

export function listThemePresets(): ThemePreset[] {
  return [UNSUPPORTED_THEME_PRESET];
}

export function formatThemePresetPropAssignments(
  input: ThemePresetId | ThemePreset | string,
): string {
  void input;
  return "";
}

export function formatThemePresetImports(
  input: ThemePresetId | ThemePreset | string,
): string {
  void input;
  return "";
}

export function buildThemeSetupSnippet(
  input: ThemePresetId | ThemePreset | string,
  options?: {
    childLines?: string[];
    additionalProps?: ThemeProviderProp[];
  },
): string {
  void input;
  void options;

  return [
    "// Theme bootstrap is unsupported until provider, import, prop, and font facts resolve to EvidenceRefs.",
    "// Supply source-backed registry context, project policy, workflow evidence, or explicit workflow input before generating theme code.",
  ].join("\n");
}

export function buildThemeAppStarterCode(
  input: ThemePresetId | ThemePreset | string,
  options?: {
    componentName?: string;
    childLines?: string[];
    additionalProps?: ThemeProviderProp[];
  },
): string {
  void input;
  void options?.additionalProps;

  const componentName = options?.componentName ?? "Example";
  const childLines = options?.childLines ?? [
    "<section>{/* Theme bootstrap pending evidence. */}</section>",
  ];

  return [
    `export function ${componentName}() {`,
    "  return (",
    ...childLines.map((line) => `    ${line}`),
    "  );",
    "}",
  ].join("\n");
}

export function buildThemeReferenceMarkdown(): string {
  return [
    "# Theme Bootstrap",
    "",
    "## Evidence Required",
    "",
    "Provider and theme bootstrap guidance is unsupported in this static skill reference until the specific names, imports, props, fonts, package paths, and compatibility paths are backed by workflow evidence, registry-backed generated context with evidence refs, `.salt` project policy, or explicit user input.",
    "",
    "Do not fill this gap from skill prose, generated prompt text, generic React guidance, copied repo code, or model memory.",
    "",
    "If provider or theme bootstrap matters and no evidence source supplies it, mark the theme decision as pending or unsupported and continue only with workflow steps that do not require those facts.",
    "",
    "## Accepted Evidence Sources",
    "",
    "- workflow output with complete evidence",
    "- registry-backed generated context with evidence refs",
    "- `.salt` project policy",
    "- explicit user input captured as workflow input",
    "",
  ]
    .filter((line, index, lines) => {
      if (line.length > 0) {
        return true;
      }

      return lines[index - 1] !== "";
    })
    .join("\n");
}
