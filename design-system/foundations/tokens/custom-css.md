# Custom CSS Rules

When Salt components don't cover your exact need, you may write custom CSS. Follow these rules to stay compatible with Salt's theming, mode, and density system.

## Always use `--salt-*` tokens

Every color, spacing, and typography value in custom CSS must come from a Salt token:

```css
/* ✅ Correct */
.myComponent {
  background: var(--salt-container-primary-background);
  color: var(--salt-content-primary-foreground);
  padding: var(--salt-spacing-100) var(--salt-spacing-200);
  font-family: var(--salt-typography-fontFamily);
}

/* ❌ Wrong */
.myComponent {
  background: #ffffff;
  color: #333;
  padding: 8px 16px;
  font-family: "Open Sans", sans-serif;
}
```

## Component-scoped styles

Use descriptive class names scoped to your component. Prefer CSS modules or a naming convention that avoids global collisions:

```css
/* CSS Module: MyWidget.module.css */
.root {
  background: var(--salt-container-primary-background);
  border: 1px solid var(--salt-container-primary-border-color);
  padding: var(--salt-spacing-200);
}

.header {
  color: var(--salt-content-primary-foreground);
  font-weight: var(--salt-typography-fontWeight-semiBold);
  margin-bottom: var(--salt-spacing-100);
}
```

```tsx
import styles from "./MyWidget.module.css";

export const MyWidget = () => (
  <div className={styles.root}>
    <div className={styles.header}>Title</div>
  </div>
);
```

## When non-Salt values are acceptable

In rare cases, values outside Salt tokens are appropriate:

- **Animations and transitions**: `transition: opacity 200ms ease`, `animation: fadeIn 300ms`
- **Transforms**: `transform: rotate(45deg)`, `translate(-50%, -50%)`
- **Layout mechanics**: `position: absolute`, `z-index: 10`, `overflow: hidden`
- **Specific dimensions**: `width: 300px` for a fixed-width sidebar, `max-width: 80ch` for readable line length

Even in these cases, prefer tokens where available (e.g., `gap: var(--salt-spacing-200)` over `gap: 16px`).

## Edge cases not covered by Salt

If you encounter a styling need with no matching Salt token:

1. **Check the Salt docs** — you may have missed a token.
2. **Use the closest characteristic token** that semantically fits.
3. **As a last resort**, use a non-token value and add a comment explaining why:

```css
.specialBorder {
  /* No Salt token for dashed borders — using solid color token with custom style */
  border: 2px dashed var(--salt-container-primary-border-color);
}
```

## Don'ts

- **Don't use `!important`** to override Salt component styles. If a Salt component doesn't look right, check that you're using the correct props and tokens, or compose differently.
- **Don't override Salt internal class names.** Salt component internals (`.saltButton`, `.saltInput`, etc.) are not part of the public API and may change.
- **Don't create global styles** that could conflict with Salt. Use CSS modules, scoped class names, or a BEM-like convention.
- **Don't duplicate what Salt components already do.** If you're writing CSS that recreates a Button, Card, or Input — use the Salt component instead.
