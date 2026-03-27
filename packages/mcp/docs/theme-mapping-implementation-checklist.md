# Theme Mapping Implementation Checklist

This file is the execution checklist for making Salt theme-to-code mapping first-class product knowledge for the AI tooling.

Use it to keep the default JPM Brand bootstrap and Legacy compatibility path consistent across:

- user docs
- registry generation
- MCP guide retrieval
- starter code
- future `create` and `migrate` recommendations

## Scope

Keep the source of truth small and explicit:

- `jpm-brand`
  - `SaltProviderNext`
  - `@salt-ds/theme/index.css`
  - `@salt-ds/theme/css/theme-next.css`
  - `accent="teal"`
  - `corner="rounded"`
  - `headingFont="Amplitude"`
  - `actionFont="Amplitude"`
- `legacy`
  - `SaltProvider`
  - `@salt-ds/theme/index.css`

Do not add a new public MCP tool for theme selection. Keep this as structured canonical data consumed by existing workflows and guides.

## Checklist

### 1. Structured Theme Presets

- Add a single theme preset module in `semantic-core`.
- Model provider, imports, default props, and any required font setup.
- Expose helpers for:
  - guide snippets
  - starter/app bootstrap code
  - search-friendly prose summaries

Done when:

- the default new-work theme and the Legacy path can be resolved without scraping docs examples

### 2. User Docs

- Update Getting Started to show the default JPM Brand bootstrap for new work.
- Keep Themes as the canonical explanation of theme choice, migration context, and Figma alignment.
- Make the Amplitude requirement explicit anywhere JPM Brand code is shown.

Done when:

- Getting Started and Themes use the same provider/import/prop mapping

### 3. Registry And MCP

- Generate the Themes guide snippet from the structured preset, not by hoping doc extraction lands on the correct code block.
- Add explicit guide statements for provider/import/prop mapping so search and retrieval can find the exact defaults.
- Regenerate `guides.json` and `search-index.jsonl`.

Done when:

- `guide.themes` returns the exact JPM Brand code snippet
- prop-level searches such as `SaltProviderNext teal Amplitude` can match the Themes guide

### 4. Starter And Workflow Integration

- Update starter code that scaffolds the default app/provider wrapper to use the default theme preset.
- Keep future `create` and `migrate` recommendations on the same preset source.
- Avoid transport drift between CLI and MCP answers.

Done when:

- starter output uses `SaltProviderNext` with the default props for default new-work paths

### 5. Regression Coverage

- Test the structured preset data directly.
- Test theme guide extraction.
- Test starter output.
- Keep docs and generated guide snippets aligned.

Done when:

- a docs-only or starter-only change cannot silently drop the default theme mapping
