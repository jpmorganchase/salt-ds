# Salt Provider (Copilot Context)

Context provider for Salt theme, mode, density, and breakpoints across a component subtree.

- API: ./salt-provider.json
- Guidance: ./salt-provider.md

## Key rules
- Use one root `SaltProvider` for global app defaults.
- Use nested providers only when scoped overrides are truly needed.
- Keep `enableStyleInjection` enabled unless component CSS is intentionally managed externally.
- Choose `applyClassesTo` deliberately: `root` for document-level, `scope` for wrapper-level, `child` only for a single valid child element.
- Use `useTheme`, `useDensity`, and `useBreakpoints` within descendants to read current context.

## Example
```tsx
import { SaltProvider } from "@salt-ds/core";

<SaltProvider mode="dark" density="high">
	<App />
</SaltProvider>
```
