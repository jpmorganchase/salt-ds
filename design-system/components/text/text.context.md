# Text (Copilot Context)

Typography primitives for semantic headings, body text, notation, and display styles.

- API: ./text.json
- Guidance: ./text.md

## Key rules
- Use Salt text primitives (`Text`, `H1`..`H4`, `Display1`..`Display4`, aliases) rather than raw styled HTML text
- Keep semantics correct first (heading levels, paragraph structure); use `styleAs` only for visual remapping
- Use `color="secondary"` for supporting copy and status colors only for status semantics
- When applying `maxRows`, pair truncation with a way to access full text (tooltip/expand)
- Avoid skipping heading levels and avoid multiple `H1` headings in a page context

## Example
```tsx
import { H1, H2, StackLayout, Text, Tooltip } from "@salt-ds/core";

<StackLayout gap={1}>
  <H1>Trade summary</H1>
  <H2 styleAs="h3">Counterparty details</H2>
  <Tooltip content="Full counterparty legal name available on focus/hover">
    <Text maxRows={1}>Long Counterparty Legal Entity Name Incorporated</Text>
  </Tooltip>
  <Text color="secondary">Updated 2 minutes ago</Text>
</StackLayout>
```
