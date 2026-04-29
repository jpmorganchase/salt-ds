# Skip Link (Copilot Context)

Accessible skip navigation link for bypassing repeated page/header content.

- API: ./skip-link.json
- Guidance: ./skip-link.md

## Key rules
- Import from `@salt-ds/core`.
- `targetId` is required and must match a real element ID in the rendered view.
- Place skip link as the first focusable element in the page shell/header.
- Use explicit destination label text (for example, "Skip to main content").
- Preserve default keyboard behavior: `Tab` reveal/focus, `Enter`/`Space` activate and move focus to target.
- If target is missing, SkipLink will not render; avoid generating broken targets.

## Example
```tsx
import { SkipLink } from "@salt-ds/core";

<header>
	<SkipLink targetId="main-content">Skip to main content</SkipLink>
</header>
<main>
	<h1 id="main-content">Dashboard</h1>
</main>
```
