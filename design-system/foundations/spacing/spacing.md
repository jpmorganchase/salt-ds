# Spacing

Salt provides a spacing scale as CSS custom properties (`--salt-spacing-*`). These tokens adapt to density and theme, ensuring consistent spatial rhythm.

## Spacing scale

| Token                  | Value | Use case                          |
| ---------------------- | ----- | --------------------------------- |
| `--salt-spacing-25`    | 2px   | Hairline gaps, icon–text nudges   |
| `--salt-spacing-50`    | 4px   | Tight internal padding            |
| `--salt-spacing-75`    | 6px   | Compact padding                   |
| `--salt-spacing-100`   | 8px   | Base unit — default gap           |
| `--salt-spacing-150`   | 12px  | Comfortable internal spacing      |
| `--salt-spacing-200`   | 16px  | Standard section gap              |
| `--salt-spacing-250`   | 20px  | Generous padding                  |
| `--salt-spacing-300`   | 24px  | Large section separation          |
| `--salt-spacing-350`   | 28px  | Extra-large spacing               |
| `--salt-spacing-400`   | 32px  | Maximum standard spacing          |

## Layout gap prop

Salt layout components (`StackLayout`, `FlowLayout`, `FlexLayout`, `GridLayout`, `SplitLayout`) accept a numeric `gap` prop that maps to the spacing scale:

| gap | Token                | Resolved value |
| --- | -------------------- | -------------- |
| 0   | —                    | 0              |
| 1   | `--salt-spacing-100` | 8px            |
| 2   | `--salt-spacing-200` | 16px           |
| 3   | `--salt-spacing-300` | 24px           |
| 4   | `--salt-spacing-400` | 32px           |

**Always use the `gap` prop** on layout components instead of adding custom margin or padding between children.

## Rules

- **Use layout components for spacing between elements.** Prefer the `gap` prop on `StackLayout`, `FlowLayout`, etc., over custom margin/padding.
- **Use `--salt-spacing-*` tokens when custom CSS is required.** For example: `padding: var(--salt-spacing-200);`
- **Never hard-code pixel values for spacing.** Hard-coded values won't adapt to density changes.
- **Be consistent.** Use the same gap value for elements at the same level within a component or section.
- **Prefer smaller numbers on the scale for internal component spacing** and larger numbers for separating distinct sections.

## Examples

### Layout gap

```tsx
<StackLayout gap={1}>
  <Text>First item</Text>
  <Text>Second item</Text>
</StackLayout>
```

### Custom CSS with tokens

```css
.myComponent {
  padding: var(--salt-spacing-100) var(--salt-spacing-200);
  margin-bottom: var(--salt-spacing-300);
}
```

### Don't

```css
/* ❌ Never hard-code pixel values */
.myComponent {
  padding: 8px 16px;
  gap: 12px;
}
```
