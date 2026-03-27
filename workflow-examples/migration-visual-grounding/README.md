# Migration Visual Grounding Alpha Fixtures

This fixture set is the smallest reusable alpha packet for comparing migration quality across evidence levels.

Use it when you want to compare the same migration task in four variants:

1. source-only
2. outline-only
3. runtime-only
4. combined outline + runtime

Files:

- `legacy-orders.query.txt`
  - shared migration prompt for the source-only, runtime-only, and combined variants
- `legacy-orders.source-outline.json`
  - structured mockup-style regions, actions, states, and notes for the outline-only and combined variants
- `legacy-orders.runtime.html`
  - static current-UI fixture that can be served locally for the runtime-only and combined variants
- `legacy-orders.scorecard.template.json`
  - structured scorecard template for alpha runs
- `run-alpha-matrix.mjs`
  - runs all four variants and writes a filled scorecard skeleton plus per-variant payload artifacts

Recommended usage:

1. Run the query by itself for the source-only baseline.
2. Run the outline by itself for the outline-only mockup path.
3. Serve `legacy-orders.runtime.html` locally and run the query with `--url` for the runtime-only path.
4. Run the query with both `--source-outline` and `--url` for the combined path.

Or run the full matrix automatically:

```bash
node workflow-examples/migration-visual-grounding/run-alpha-matrix.mjs
```

Expected signal differences:

- source-only
  - broad migration plan
  - generic clarification questions
  - no explicit visual evidence impact
- outline-only
  - stronger region/action/state modeling
  - better mockup-style scoping
  - no live landmark validation
- runtime-only
  - stronger landmark and action-anchor capture
  - better current-experience preservation guidance
  - no structured mockup reconciliation
- combined
  - sharper clarification questions
  - stronger preserve and confirmation checks
  - explicit mismatch handling between mockup-style intent and live UI evidence

Current alpha boundary:

- raw screenshot or image ingestion is not direct yet
- use `source-outline` as the mockup-style stand-in for screenshot or Figma notes
- use `--url` for live current-UI capture
