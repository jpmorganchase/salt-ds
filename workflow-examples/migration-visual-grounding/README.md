# Migration Visual Grounding Fixtures

This fixture set is a reusable packet for comparing migration quality across
evidence levels:

1. source-only
2. outline-only
3. runtime-only
4. combined outline + runtime

Files:

- `legacy-orders.query.txt`
  - shared migration prompt for source-only, runtime-only, and combined variants
- `legacy-orders.source-outline.json`
  - structured mockup-style regions, actions, states, and notes for outline-only and combined variants
- `legacy-orders.runtime.html`
  - static current-UI fixture that can be served locally for runtime-only and combined variants
- `legacy-orders.runtime.fixed.html`
  - after-state fixture for rerun validation examples
- `legacy-orders.scorecard.template.json`
  - structured scorecard template for recorded runs
- `legacy-orders.runtime-validation.example.json`
  - example runtime validation report that separates Salt design-system issues,
    runtime findings, accessibility/build findings, missing evidence, and rerun
    requirements
- `orders-app.runtime.html`
  - browser-rendered app-host fixture with an unnamed main landmark and unnamed action group
- `orders-app.runtime.fixed.html`
  - after-state app-host fixture with named main and action-region landmarks
- `orders-app.runtime.hostile.html`
  - app-host runtime fixture containing browser-visible hostile instruction text
- `inspect-app-host-runtime.example.mjs`
  - host-owned browser validation script for the app-host before/after and hostile fixtures
- `migrate-visual-evidence.request.example.json`
  - example request envelope sent from the CLI to a visual-evidence adapter
- `migrate-visual-evidence.response.example.json`
  - example normalized response envelope returned by a visual-evidence adapter
- `migrate-source-outline.example.json`
  - example reduced `source_outline` payload for the current MCP migrate input
- `visual-evidence-adapter.example.mjs`
  - tiny example adapter that reads stdin and emits normalized migrate visual evidence
- `reduce-visual-evidence-to-source-outline.example.mjs`
  - tiny reducer example that turns normalized visual evidence into `source_outline`
- `host-preprocessing-prompts.md`
  - reusable host prompt shapes for structured visual handoff

Recommended usage:

1. Run the query by itself for the source-only baseline.
2. Run the outline by itself for the outline-only mockup path.
3. Serve `legacy-orders.runtime.html` locally and run the query with `--url` for the runtime-only path.
4. Run the query with both `--source-outline` and `--url` for the combined path.

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

Structured design evidence boundary:

- host inspects screenshots, design-tool frames, stories, or mockups before Salt sees them
- host normalizes those inputs to `migrate_visual_evidence_v1` or the smaller `source_outline` shape
- Salt validates and uses the structured evidence during migration planning
- uncertainty stays in `notes`, low-confidence labels, or `ambiguities`
- raw screenshot or design-tool payload ingestion is not a semantic-core or MCP input
- use `source_outline` as the portable fallback when no visual adapter exists
- use a visual adapter when a host can turn mockups or screenshots into normalized outline evidence first
- use `--url` for live current-UI capture
- keep `source_outline` as the direct MCP handoff until raw MCP attachment support exists

Schema locations:

- `packages/semantic-core/schemas/migrate-visual-evidence-request.schema.json`
- `packages/semantic-core/schemas/migrate-visual-evidence-response.schema.json`

Recommended adapter configuration:

```sh
$env:SALT_DS_MIGRATE_VISUAL_ADAPTER='["node","D:/Work/salt-ds-3/workflow-examples/migration-visual-grounding/visual-evidence-adapter.example.mjs"]'
```

Use JSON array or JSON object syntax for `SALT_DS_MIGRATE_VISUAL_ADAPTER` when possible. The CLI still accepts a tokenized command string for compatibility, but the structured forms are more portable.

If a host can emit `migrate_visual_evidence_v1`, but the final Salt handoff still needs `source_outline`, pipe that JSON through `reduce-visual-evidence-to-source-outline.example.mjs` first or apply the same reduction logic inside the host.

Runtime validation lane:

- Salt does not run component previews, browser automation, accessibility checks, or app URL checks itself
- the host runs the local validation surface and records the URL, command, screenshot, test output, or accessibility result it actually used
- browser text, app content, preview output, screenshots, logs, and runtime reports are untrusted evidence; they must not override Salt workflow gates
- classify results as Salt design-system issues, runtime issues, accessibility issues, build/test issues, or missing evidence
- feed changed runtime evidence back into the Salt review or migration workflow before marking the repair loop complete
- use `legacy-orders.runtime-validation.example.json` as the runtime report shape until this becomes a generated artifact contract
