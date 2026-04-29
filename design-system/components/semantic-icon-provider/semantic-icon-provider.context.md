# Semantic Icon Provider (Copilot Context)

Context provider for semantic icon mapping in Salt components.

- API: ./semantic-icon-provider.json
- Guidance: ./semantic-icon-provider.md

## Key rules
- Import from `@salt-ds/core` and wrap the subtree that should receive icon overrides.
- Use `iconMap` as a partial override object; unspecified semantic keys must fall back to defaults.
- Prefer small, targeted icon overrides (for example `ExpandIcon`, `CollapseIcon`) instead of redefining everything unless required.
- Use `useIcon()` in descendant custom components when direct semantic icon retrieval is needed.
- Keep replacement icons semantically appropriate for the consuming component context.

## Example
```tsx
import { Dropdown, Option, SemanticIconProvider } from "@salt-ds/core";
import { DoubleChevronDownIcon, DoubleChevronUpIcon } from "@salt-ds/icons";

<SemanticIconProvider
	iconMap={{
		ExpandIcon: DoubleChevronDownIcon,
		CollapseIcon: DoubleChevronUpIcon,
	}}
>
	<Dropdown>
		<Option value="Alabama" />
	</Dropdown>
</SemanticIconProvider>
```
