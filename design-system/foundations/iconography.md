# Iconography

Salt provides a comprehensive icon library via `@salt-ds/icons`. Icons follow density scaling and are designed for consistency with Salt components.

## Importing icons

```tsx
import { SearchIcon, CloseIcon, SettingsIcon } from "@salt-ds/icons";
```

All icons are named exports from `@salt-ds/icons` using PascalCase with an `Icon` suffix.

## Size

Icons follow the current density by default. Override size with the `size` prop:

| `size` prop | Rendered size |
| ----------- | ------------- |
| 1           | 12px          |
| 2           | 16px          |

At medium density, the default icon size is 12px.

```tsx
<SearchIcon />          {/* Default size (density-dependent) */}
<SearchIcon size={2} /> {/* 16px */}
```

## Icons with labels

Pair icons with text for clarity:

```tsx
<Button>
  <SearchIcon /> Search
</Button>
```

When icon and text appear together, the icon inherits meaning from the adjacent label — no extra accessibility attributes are needed.

## Icon-only usage

When an icon appears **without visible text** (e.g., an icon-only button), you **must** provide an accessible label on the parent interactive element:

```tsx
/* ✅ Icon-only button with aria-label */
<Button aria-label="Search">
  <SearchIcon />
</Button>

/* ❌ Missing accessible label */
<Button>
  <SearchIcon />
</Button>
```

The `aria-label` goes on the **parent interactive element** (Button, IconButton, etc.), not on the icon itself.

## Rules

- **Import from `@salt-ds/icons`** — don't use custom SVGs when a Salt icon exists.
- **Every icon must convey meaning.** Don't use icons as decoration. If an icon doesn't add information, remove it.
- **Icon-only interactive elements require `aria-label`** on the parent for accessibility.
- **Use the `size` prop** to override default sizing when needed — don't set icon size via custom CSS.
- **Prefer Salt icons over custom SVGs** for visual consistency with the design system.
- **Don't resize icons with CSS** (`width`, `height`, `font-size`). Use the `size` prop.

## Examples

### In a button group

```tsx
import { Button } from "@salt-ds/core";
import { AddIcon, DeleteIcon } from "@salt-ds/icons";

<FlowLayout>
  <Button>
    <AddIcon /> Add item
  </Button>
  <Button sentiment="negative">
    <DeleteIcon /> Delete
  </Button>
</FlowLayout>
```

### Icon-only toolbar

```tsx
import { Button } from "@salt-ds/core";
import { SearchIcon, FilterIcon, RefreshIcon } from "@salt-ds/icons";

<FlowLayout gap={1}>
  <Button aria-label="Search" appearance="transparent">
    <SearchIcon />
  </Button>
  <Button aria-label="Filter" appearance="transparent">
    <FilterIcon />
  </Button>
  <Button aria-label="Refresh" appearance="transparent">
    <RefreshIcon />
  </Button>
</FlowLayout>
```
