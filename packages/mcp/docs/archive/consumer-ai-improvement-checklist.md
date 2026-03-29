# Consumer AI Improvement Checklist

Use this as the short working list for improving real consumer outcomes in Salt app development.

For broader planning context, see [`../maintainers/consumer-ai-roadmap.md`](../maintainers/consumer-ai-roadmap.md).  
For package-level implementation detail, see [`package-architecture-implementation-plan.md`](./package-architecture-implementation-plan.md).
For the workflow-first simplification direction across MCP and no-MCP environments, see [`consumer-workflow-simplification.md`](./consumer-workflow-simplification.md).

## Highest Impact

1. Add canonical app examples for the asks agents keep missing.

- dashboard with metric cards
- app shell and navigation
- filter toolbar
- empty, loading, and error states
- centering or alignment fix on existing Salt UI

Why:

- examples improve both human docs and AI grounding more than more general prose docs

2. Tighten the builder workflow so Salt selection is mandatory.

Require every Salt UI build answer to show:

- chosen Salt primitives or patterns
- canonical example or entity used to ground them
- why any native element or custom CSS is still needed

Likely files:

- [`SKILL.md`](../../skills/skills/salt-ui-builder/SKILL.md)
- [`build-workflow.md`](../../skills/skills/salt-ui-builder/references/build-workflow.md)
- [`output-template.md`](../../skills/skills/salt-ui-builder/references/output-template.md)

3. Add validator checks for “reinventing Salt”.

Teach `analyze_salt_code` and `salt lint` to warn when code is clearly rebuilding common Salt UI with raw HTML and CSS.

Start with:

- metric-card compositions
- custom nav strips
- ad hoc separators and surfaces
- native buttons or links where Salt primitives should exist

Likely files:

- [`validateSaltUsage.ts`](../../semantic-core/src/tools/validateSaltUsage.ts)
- [`validation`](../../semantic-core/src/tools/validation)
- [`lint.ts`](../../cli/src/commands/lint.ts)

## Next

4. Add a stricter Salt UI preflight and finalize gate.

For Salt UI tasks, require:

- selection
- grounding
- validation

before the workflow is considered complete.

Reference:

- [`request.md`](./request.md)

5. Improve fix and debug reliability, not just build reliability.

Keep expanding the reviewer debug path for:

- alignment
- layout ownership
- wrapper conflicts
- smallest-fix verification

Likely files:

- [`SKILL.md`](../../skills/skills/salt-ui-reviewer/SKILL.md)
- [`debug-workflow.md`](../../skills/skills/salt-ui-reviewer/references/debug-workflow.md)

6. Keep token policy as validation, not as the main teaching surface.

Continue:

- docs-first audit
- narrow extraction where docs are explicit
- validator enforcement after coding

Do not:

- add more agent-only token summary docs
- make token guidance the main app-building workflow

## Validation

7. Test all of this in real new repos, not just smoke tests.

Run real asks like:

- build a dashboard with a metric
- fix nav centering
- build a filter toolbar
- convert a plain React panel to Salt

Then record where the agent still skips Salt.
