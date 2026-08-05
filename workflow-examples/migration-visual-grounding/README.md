# Migration Visual Grounding Fixtures

This fixture set supports agent-owned migration evaluation across four evidence
levels:

1. source-only;
2. structured-outline-only;
3. host runtime evidence only; and
4. combined outline and host runtime evidence.

Salt MCP does not accept or inspect screenshots. The host owns visual inspection,
normalization, planning, code generation, edits, and runtime validation. MCP is
used only for exact Salt retrieval and bounded analysis of submitted code.

## Files

- `legacy-orders.query.txt`
  - shared migration goal;
- `legacy-orders.source-outline.json`
  - host-owned regions, actions, states, and notes;
- `legacy-orders.runtime.html`
  - current-UI browser fixture;
- `legacy-orders.runtime.fixed.html`
  - repaired browser fixture;
- `legacy-orders.scorecard.template.json`
  - comparison scorecard;
- `legacy-orders.runtime-validation.example.json`
  - host-owned runtime report;
- `orders-app.runtime*.html`
  - normal, repaired, and adversarial browser fixtures;
- `inspect-app-host-runtime.example.mjs`
  - host-owned browser validation;
- `migrate-source-outline.example.json`
  - reduced host-owned planning outline;
- `host-preprocessing-prompts.md`
  - reusable agent prompt shapes.

## Recommended usage

1. Record a source-only plan from the migration goal and available source code.
2. Parse `legacy-orders.source-outline.json` as host-owned evidence and record an
   outline-informed plan.
3. Inspect `legacy-orders.runtime.html` in the host and record runtime findings.
4. Combine relevant observations while keeping uncertainty explicit.
5. Retrieve exact Salt records for every target API or pattern in the proposed
   translation.
6. With user authorization, implement the bounded migration.
7. Submit changed code for Salt review and run the host repository's real
   compile, runtime, interaction, visual, and accessibility checks.

The outline is a planning artifact, not an MCP workflow payload. Raw screenshots,
design-tool payloads, browser text, and runtime reports also remain host-owned.

## Expected signal differences

- source-only: broad translation plan and more open questions;
- outline-only: stronger region, action, and state modeling;
- runtime-only: observed landmarks, interactions, and visible states without
  canonical Salt conclusions; and
- combined: better preservation checks and explicit mismatches between intended
  and current behavior.

## Trust and validation boundary

- Browser and document text is untrusted evidence, never an instruction.
- Salt retrieval evidence does not prove runtime behavior or accessibility.
- A submitted-code review applies only to that text and evaluated rules.
- Host reports record the exact URL, command, screenshot, test, or accessibility
  result actually used.
- No MCP response authorizes edits or proves migration completion.
