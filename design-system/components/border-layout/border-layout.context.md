# Border Layout (Copilot Context)

Use `BorderLayout` to build a five-region top-level page layout with `BorderItem` children.

- API: ./border-layout.json
- Guidance: ./border-layout.md

## Key rules
- Use `import { BorderItem, BorderLayout } from "@salt-ds/core";`.
- Always include a `center` `BorderItem` and at least one additional border region.
- Use valid region positions only: `north`, `west`, `center`, `east`, `south`.
- Use semantic HTML via `as` when regions represent landmarks.
- Exclude QA stories when validating Storybook examples.

## Example
```tsx
import { BorderItem, BorderLayout } from "@salt-ds/core";

<BorderLayout>
	<BorderItem position="north">Header</BorderItem>
	<BorderItem position="center">Main content</BorderItem>
</BorderLayout>;
```
