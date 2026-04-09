# Explore Options

Use this file only when the user explicitly asks for alternatives, comparisons, or multiple directions.
Do not use it by default.

## Entry Rule

Before exploring options:

- ground the top-level Salt surface canonically
- preserve the user task and main workflow
- identify the non-negotiable constraints that both options must respect

If the top-level surface is still unresolved, do not branch into options yet.

## Option Count

Default to two options.
Exceed two only when the user explicitly asks for more.
More than two usually creates noise in IDE workflows.

Use this pairing by default:

1. **Conservative direction**
   - closest to the canonical Salt default
   - lowest structural risk
   - easiest to implement and review
2. **Opinionated direction**
   - still Salt-valid
   - changes composition, emphasis, or information flow in a meaningful but bounded way
   - must still preserve the same user job and core states

## What May Vary

Allow options to vary in:

- layout ownership
- information hierarchy
- whether navigation, summary, or task flow is emphasized first
- shell vs content emphasis
- where supporting states appear

Do not vary options mainly through theme, decorative styling, or arbitrary widget changes.

## Output Pattern

For each option, include:

- what stays invariant
- the composition direction
- why it fits the task
- main trade-offs
- implementation or review risk

Then end with:

- which option you recommend as the default continuation
- what would make you choose the other option instead

## Anti-Patterns

- do not generate radically different options that break Salt consistency
- do not present options before the surface is grounded
- do not produce more than two options unless the user explicitly asks for more
- do not compare options in a dense table; explain the trade-offs in prose
