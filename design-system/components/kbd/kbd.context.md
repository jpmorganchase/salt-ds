# Kbd (Copilot Context)

Decorative semantic keycap element for keyboard shortcuts.

- API: ./kbd.json
- Guidance: ./kbd.md

## Key rules
- Use exact import: `import { Kbd } from "@salt-ds/core"`
- Use only for real keyboard keys and short key combinations
- Keep each key token separate and include visible separators (for example `+`)
- Pair with descriptive text that explains what the shortcut does
- Do not use Kbd for non-keyboard actions or decorative text

## Example

```tsx
import { FlexLayout, Kbd, Text } from "@salt-ds/core";

function ExampleKbd() {
	return (
		<FlexLayout gap={0.5} align="center" wrap>
			<Text>Press</Text>
			<Kbd>Ctrl</Kbd>
			<Text>+</Text>
			<Kbd>K</Kbd>
			<Text>to open search</Text>
		</FlexLayout>
	);
}
```
