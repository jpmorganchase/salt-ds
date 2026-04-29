# Typography

Salt provides text components and typography tokens that adapt to density and theme. Always use Salt text components instead of raw HTML elements.

## Text components

| Component                          | Use case                                      |
| ---------------------------------- | --------------------------------------------- |
| `<Display1>`, `<Display2>`, `<Display3>` | Hero text and prominent page titles     |
| `<H1>`                            | Top-level section heading                      |
| `<H2>`                            | Second-level heading                           |
| `<H3>`                            | Third-level heading                            |
| `<H4>`                            | Fourth-level heading                           |
| `<Text>`                          | Body copy (default), labels, annotations       |
| `<Label>`                         | Form field labels                              |

All are imported from `@salt-ds/core`:

```tsx
import { Display1, H1, H2, H3, H4, Text, Label } from "@salt-ds/core";
```

## Heading hierarchy

Maintain a logical heading hierarchy — don't skip levels:

```tsx
/* ✅ Correct hierarchy */
<H1>Page title</H1>
<H2>Section</H2>
<H3>Subsection</H3>

/* ❌ Skipped level */
<H1>Page title</H1>
<H3>Subsection</H3>
```

## The `styleAs` prop

`<Text>` supports a `styleAs` prop to visually style text as a different variant without changing semantic meaning:

```tsx
<Text styleAs="label">This looks like a label but is a paragraph</Text>
```

Use this when you need visual flexibility while keeping correct semantics.

## Rules

- **Use Salt text components** (`Text`, `H1`–`H4`, `Display1`–`Display3`, `Label`) instead of raw HTML (`<p>`, `<h1>`, `<span>`).
- **Display** is for hero text and prominent page titles only — don't use it for regular headings.
- **Maintain heading hierarchy.** Don't skip heading levels (e.g., `H1` → `H3`).
- **Never hard-code `font-family`, `font-size`, or `line-height`.** These are managed by Salt tokens.
- **For custom text styling in CSS**, use typography tokens:
  - `--salt-typography-fontFamily` — default font
  - `--salt-typography-fontFamily-code` — monospace font
  - `--salt-typography-fontWeight-*` — weight variants
  - `--salt-text-*-fontSize` — size tokens
  - `--salt-text-*-lineHeight` — line height tokens

## Examples

### Page with headings and body text

```tsx
<Display1>Welcome</Display1>
<H1>Dashboard</H1>
<Text>View your recent activity and key metrics below.</Text>
<H2>Performance</H2>
<Text>All systems are operating normally.</Text>
```

### Custom CSS with typography tokens

```css
.codeBlock {
  font-family: var(--salt-typography-fontFamily-code);
  font-weight: var(--salt-typography-fontWeight-regular);
}
```

### Don't

```css
/* ❌ Never hard-code font properties */
.myText {
  font-family: "Open Sans", sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
```
