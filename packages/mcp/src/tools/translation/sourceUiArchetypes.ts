import type { SourceUiKind, UiArchetype } from "./sourceUiTypes.js";

export const UI_ARCHETYPES: UiArchetype[] = [
  {
    kind: "split-action",
    label: "Primary action with secondary menu options",
    solution_type: "pattern",
    salt_query: "primary action with fallback options in a related menu",
    migration_kind: "pattern",
    query_patterns: [
      /\b(primary action|main action)\b.*\b(menu|dropdown|secondary actions|more actions)\b/i,
      /\b(split button|split action)\b/i,
    ],
    notes: [
      "Do not carry foreign menu trigger structure over directly if Salt already provides a clearer split-action pattern.",
    ],
  },
  {
    kind: "vertical-navigation",
    label: "Vertical app navigation",
    solution_type: "component",
    salt_query: "vertical application navigation sidebar",
    migration_kind: "pattern",
    query_patterns: [
      /\b(sidebar|side nav|sidenav|navigation rail|vertical navigation|left nav)\b/i,
    ],
    jsx_name_patterns: [/sidebar/i, /sidenav/i, /navrail/i],
    notes: [
      "Treat app-level navigation as a navigation structure decision, not as isolated links.",
    ],
  },
  {
    kind: "dialog",
    label: "Overlay or dialog flow",
    solution_type: "pattern",
    salt_query: "modal dialog with header body and footer actions",
    migration_kind: "pattern",
    query_patterns: [/\b(dialog|modal|drawer|sheet|overlay)\b/i],
    jsx_name_patterns: [/dialog/i, /modal/i, /drawer/i, /sheet/i],
  },
  {
    kind: "tabs",
    label: "Tabbed interface",
    solution_type: "pattern",
    salt_query: "tabbed interface with related panels",
    migration_kind: "pattern",
    query_patterns: [/\b(tabbed|tabs?|tab panel)\b/i],
    jsx_name_patterns: [/^tabs?$/i, /tabpanel/i],
  },
  {
    kind: "data-table",
    label: "Structured data display",
    solution_type: "pattern",
    salt_query: "data table with rows columns and dense information",
    migration_kind: "pattern",
    query_patterns: [/\b(table|data grid|datagrid|rows and columns)\b/i],
    jsx_name_patterns: [/^table$/i, /datagrid/i],
    notes: [
      "High-density data surfaces often need pattern-level translation, not one-to-one component swaps.",
    ],
  },
  {
    kind: "toolbar",
    label: "Toolbar or command cluster",
    solution_type: "pattern",
    salt_query: "toolbar with grouped actions and controls",
    migration_kind: "pattern",
    query_patterns: [/\b(toolbar|command bar|action bar|app bar)\b/i],
    jsx_name_patterns: [/toolbar/i, /appbar/i, /commandbar/i],
  },
  {
    kind: "text-input",
    label: "Text input field",
    solution_type: "component",
    salt_query: "collect short text input",
    migration_kind: "direct",
    query_patterns: [/\b(text field|textfield|input|search field|form field)\b/i],
    jsx_name_patterns: [/^input$/i, /^textarea$/i, /textfield/i, /input/i],
    require_form_field_support: true,
    notes: [
      "Translate field structure and validation support, not just the raw input control.",
    ],
  },
  {
    kind: "selection-control",
    label: "Selection control",
    solution_type: "component",
    salt_query: "selection control checkbox radio switch toggle",
    migration_kind: "direct",
    query_patterns: [/\b(checkbox|radio|switch|toggle|select option)\b/i],
    jsx_name_patterns: [/checkbox/i, /radio/i, /switch/i, /toggle/i, /^select$/i],
  },
  {
    kind: "navigation",
    label: "Navigation link",
    solution_type: "component",
    salt_query: "navigate to another route",
    migration_kind: "direct",
    query_patterns: [/\b(navigate|navigation|route|destination|link)\b/i],
    jsx_name_patterns: [/^a$/i, /link/i, /navlink/i],
  },
  {
    kind: "action",
    label: "Action trigger",
    solution_type: "component",
    salt_query: "trigger an immediate action",
    migration_kind: "direct",
    query_patterns: [/\b(button|cta|action|submit|save|trigger)\b/i],
    jsx_name_patterns: [/^button$/i, /button/i, /iconbutton/i, /fab/i],
  },
];

export const ARCHETYPE_PRIORITY: SourceUiKind[] = [
  "split-action",
  "vertical-navigation",
  "dialog",
  "tabs",
  "data-table",
  "toolbar",
  "text-input",
  "selection-control",
  "navigation",
  "action",
];

export function getArchetype(kind: SourceUiKind): UiArchetype {
  const archetype = UI_ARCHETYPES.find((entry) => entry.kind === kind);
  if (!archetype) {
    throw new Error(`Unknown UI archetype: ${kind}`);
  }

  return archetype;
}
