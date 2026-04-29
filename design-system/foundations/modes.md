# Modes (Light / Dark)

Salt supports light and dark mode via the `mode` prop on the provider. All Salt tokens adapt automatically — no custom mode logic is needed.

## Setting mode

```tsx
import { SaltProvider } from "@salt-ds/core";

<SaltProvider mode="light">
  <App />
</SaltProvider>
```

Valid values: `"light"` | `"dark"`

## How it works

Salt characteristic tokens (e.g., `--salt-container-primary-background`) resolve to different values depending on the active mode. When you use these tokens in your CSS, your styles automatically work in both modes.

```css
/* This works in both light and dark mode — no conditional logic needed */
.myPanel {
  background: var(--salt-container-primary-background);
  color: var(--salt-content-primary-foreground);
}
```

## Scoped mode overrides

You can nest providers to set a different mode for a specific section:

```tsx
<SaltProvider mode="light">
  <MainContent />
  <SaltProvider mode="dark">
    <Sidebar />
  </SaltProvider>
</SaltProvider>
```

Use cases:
- A dark sidebar in an otherwise light application
- A dark-mode preview panel
- A branded section with a fixed mode

## Common pitfall: hard-coded colors

The most common reason custom CSS breaks in dark mode is **hard-coded color values**:

```css
/* ❌ Breaks in dark mode */
.myCard {
  background: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
}

/* ✅ Works in both modes */
.myCard {
  background: var(--salt-container-primary-background);
  color: var(--salt-content-primary-foreground);
  border: 1px solid var(--salt-container-primary-border-color);
}
```

## Testing

Always verify your custom CSS in **both** light and dark mode. Toggle the `mode` prop on the provider to check:

1. Are all text elements readable against their background?
2. Do borders and dividers have sufficient contrast?
3. Are status colors (error, warning, etc.) still distinguishable?
4. Do any hard-coded colors appear that don't adapt?

## Rules

- **Use `--salt-*` tokens for all colors in custom CSS.** This is the single most important rule for mode compatibility.
- **Never write conditional mode logic** (`if darkMode then ...`). Tokens handle this automatically.
- **Don't assume background colors.** What's white in light mode is dark in dark mode — always use tokens.
- **Test in both modes** before considering work complete.
