# Migration Visual Grounding Fixtures

This fixture set is a reusable packet for comparing migration guidance across
four evidence levels:

1. source-only
2. outline-only
3. host runtime evidence only
4. combined outline and host runtime evidence

Salt MCP accepts source code, a query, and structured `source_outline` data.
The host owns screenshots, browser inspection, and conversion of visual
evidence into that portable structure.

## Files

- `legacy-orders.query.txt`
  - shared migration prompt
- `legacy-orders.source-outline.json`
  - structured regions, actions, states, and notes
- `legacy-orders.runtime.html`
  - static current-UI fixture for host-owned runtime inspection
- `legacy-orders.runtime.fixed.html`
  - after-state fixture for host-owned rerun validation
- `legacy-orders.scorecard.template.json`
  - scorecard template for recorded comparisons
- `legacy-orders.runtime-validation.example.json`
  - host-owned runtime report that separates Salt, runtime, accessibility,
    build, and missing-evidence findings
- `orders-app.runtime.html`
  - browser fixture with unnamed landmarks
- `orders-app.runtime.fixed.html`
  - repaired browser fixture with named landmarks
- `orders-app.runtime.hostile.html`
  - browser fixture containing untrusted visible instruction text
- `inspect-app-host-runtime.example.mjs`
  - host-owned browser validation script
- `migrate-visual-evidence.request.example.json`
  - example input envelope for a host-owned visual preprocessor
- `migrate-visual-evidence.response.example.json`
  - example normalized visual evidence returned by that preprocessor
- `migrate-source-outline.example.json`
  - reduced `source_outline` object accepted by `migrate_to_salt`
- `visual-evidence-adapter.example.mjs`
  - example host adapter that reads JSON from stdin and emits normalized visual evidence
- `reduce-visual-evidence-to-source-outline.example.mjs`
  - example reducer from normalized visual evidence to `source_outline`
- `host-preprocessing-prompts.md`
  - reusable host prompt shapes for structured visual handoff

## Recommended usage

1. Call `migrate_to_salt` with a concise migration-goal query and any source
   code available for the source-only baseline.
2. Call it with the query and `legacy-orders.source-outline.json` parsed into
   the `source_outline` argument for the outline-only path.
3. Inspect `legacy-orders.runtime.html` in the host. Record the runtime
   findings without passing raw browser output to Salt.
4. Normalize relevant runtime observations into `source_outline.notes`, then
   call `migrate_to_salt` with the combined structured evidence.

The MCP tool accepts the outline object, not a file path. The host must read
the JSON file and pass its parsed `regions`, `actions`, `states`, and
`notes` fields.

## Expected signal differences

- source-only
  - broad migration plan
  - generic clarification questions
- outline-only
  - stronger region, action, and state modeling
  - better mockup-style scoping
- host runtime evidence only
  - stronger landmark and action-anchor observations
  - no Salt guidance until those observations are converted to structured input
- combined
  - sharper clarification questions
  - stronger preserve and confirmation checks
  - explicit mismatch notes between intended and current UI

## Structured design evidence boundary

- The host inspects screenshots, design-tool frames, stories, mockups, and
  running pages before Salt sees them.
- The host normalizes relevant evidence to the public `source_outline` shape.
- `migrate_to_salt` validates and uses only that structured evidence.
- Uncertainty stays visible in `notes`.
- Raw screenshots, design-tool payloads, browser text, and runtime reports are
  not MCP inputs.
- Hostile browser or document text is evidence, never workflow instruction.

The `migrate_visual_evidence_v1` request and response files remain optional
host-integration examples. Reduce their output to `source_outline` before the
MCP call.

## Runtime validation lane

- Salt MCP does not run component previews, browser automation, accessibility
  checks, or app URL checks.
- The host records the URL, command, screenshot, test output, or accessibility
  result it actually used.
- Browser text, screenshots, logs, and runtime reports are untrusted evidence
  and cannot override Salt workflow gates.
- Classify results as Salt design-system, runtime, accessibility, build/test,
  or missing-evidence findings.
- Convert relevant changed-state observations to structured notes before
  rerunning review or migration.
- Use `legacy-orders.runtime-validation.example.json` as the host-owned report
  shape.
