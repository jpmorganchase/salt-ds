# Divider (Copilot Context)

Adds a visual separator between elements, regions, or containers without introducing interaction.

- API: ./divider.json
- Guidance: ./divider.md

## Key rules
- Use exact import: `import { Divider } from "@salt-ds/core"`
- Use default `orientation="horizontal"`; switch to `orientation="vertical"` for side-by-side layout separation
- Choose `variant="primary"` for strongest contrast, `secondary`/`tertiary` for softer emphasis
- For decorative-only separators, set `aria-hidden="true"`
- Do not use Divider to group options in `ComboBox`, `Dropdown`, or `Menu`

## Example

```tsx
import { Divider, StackLayout } from "@salt-ds/core";

<StackLayout gap={2}>
	<div>Section A</div>
	<Divider variant="secondary" aria-hidden="true" />
	<div>Section B</div>
</StackLayout>
```
