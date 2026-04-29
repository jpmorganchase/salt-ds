# Density

Salt supports four density levels that control component sizing, internal spacing, and touch targets. Set density via the `density` prop on the Salt provider.

## Density levels

| Density  | Use case                                          | Description                              |
| -------- | ------------------------------------------------- | ---------------------------------------- |
| `high`   | Data-dense UIs, dashboards, trading screens       | Smallest components and spacing          |
| `medium` | General-purpose applications (default)            | Balanced sizing and spacing              |
| `low`    | Content-focused, reading-heavy interfaces         | More generous spacing and sizing         |
| `touch`  | Mobile/tablet, large touch targets                | Largest components for finger interaction |

## Setting density

```tsx
import { SaltProvider } from "@salt-ds/core";

<SaltProvider density="medium">
  <App />
</SaltProvider>
```

## How to choose

- **Default to `medium`** unless you have a specific reason to change it.
- **Use `high`** when screen space is limited and users need to see a lot of data at once (e.g., financial dashboards, data grids, dense toolbars).
- **Use `low`** when content readability is the priority (e.g., documentation, long-form content, settings pages).
- **Use `touch`** when the interface will be used on touch devices where tap targets need to be large enough for finger input.

## Scoped density overrides

You can nest providers to override density in a specific section:

```tsx
<SaltProvider density="medium">
  <MainContent />
  <SaltProvider density="high">
    <DataGrid />
  </SaltProvider>
</SaltProvider>
```

**Use this sparingly.** Mixing densities within the same view can create visual inconsistency. Valid use cases include:

- A dense data table within a medium-density page
- A touch-friendly toolbar in an otherwise medium-density app

## What density affects

- **Component sizing**: height, min-width, icon size
- **Internal spacing**: padding within components
- **Touch targets**: hit area size for interactive elements
- **Spacing tokens**: `--salt-spacing-*` values scale with density
- **Typography tokens**: font sizes may adjust at different densities

## Rules

- Set density at the provider level, not on individual components.
- Don't hard-code pixel values that conflict with density scaling.
- Test your layout at the density you've chosen to ensure nothing overflows or clips.
