# Metric Pattern

> Source: [saltdesignsystem.com/salt/patterns/metric](https://www.saltdesignsystem.com/salt/patterns/metric)
> Storybook: [patterns-metric](https://storybook.saltdesignsystem.com/?path=/story/patterns-metric--metric)

A metric displays an important number value prominently. Add indicators or labels to provide context to the presented value.

**Key components:** `Text`, `Display1`, `Display2`, `Display3`, `StackLayout`, `ArrowUpIcon`, `ArrowDownIcon`, `Link`

**Imports:**
```typescript
import { Display1, Display2, Display3, Link, StackLayout, Text } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
```

## When to Use

Give more prominence to key measurements. Metrics are common building blocks in dashboards, directing users to key information they may otherwise overlook.

**Best practices:**
- Place metrics higher in layout to emphasise importance.
- Never leave the user guessing — provide enough context via subtitles and indicators.
- Keep titles and values short. Round/truncate to significant figures; use common abbreviations.
- Avoid displaying more than **5 metrics** in a single dashboard view.

## Anatomy

1. **Title** — label identifying what the metric measures (e.g., "Performance").
2. **Subtitle** — optional secondary descriptor below the title (e.g., "Interactions").
3. **Metric value** — the prominent number displayed using a Display component.
4. **Subvalue** — optional supporting value below the metric (e.g., "+10 (+1.23%)").
5. **Visual indicator** — optional directional icon inside the Display component (e.g., arrow up/down).

## Build Rules

### Component composition

All metrics are built from the same Salt primitives arranged in a `StackLayout`:

| Element | Salt component | Notes |
|---|---|---|
| Container | `StackLayout` | `gap={0}` for vertical; `gap={1}` + `direction="row"` for horizontal |
| Title | `Text` | Wrap label in `<strong>` for bold weight |
| Subtitle | `Text variant="secondary"` | Or `Link variant="secondary"` if navigation is needed |
| Metric value | `Display1` / `Display2` / `Display3` | Size determines visual hierarchy |
| Subvalue | `Text` | Styled with sentiment colour token (see below) |
| Indicator icon | `ArrowUpIcon` / `ArrowDownIcon` | Placed **inside** the Display component as a child |

### Sizes and typography tokens

| Size | Display component | Icon `size` prop | Horizontal `marginTop` on title |
|---|---|---|---|
| Large | `Display1` | `3` | `var(--salt-spacing-150)` |
| Medium | `Display2` | `2` | `var(--salt-spacing-100)` |
| Small | `Display3` | `1` | `var(--salt-spacing-50)` |

### Layout tokens

| Layout | `StackLayout` props | Title style |
|---|---|---|
| Vertical (default) | `gap={0}` | No additional margin |
| Horizontal | `direction="row"` `gap={1}` | `style={{ marginTop: "var(--salt-spacing-*)" }}` per size table above |

**Rule:** Use the same orientation for all metrics in a single view. Do not mix vertical and horizontal.

### Sentiment colour tokens

| Direction | Icon fill token | Subvalue text colour token |
|---|---|---|
| Positive (up) | `var(--salt-sentiment-positive-foreground-decorative)` | `var(--salt-sentiment-positive-foreground-informative)` |
| Negative (down) | `var(--salt-sentiment-negative-foreground-decorative)` | `var(--salt-sentiment-negative-foreground-informative)` |

Apply via inline `style`:
- **Icon:** `style={{ fill: "var(--salt-sentiment-*-foreground-decorative)" }}`
- **Subvalue text:** `style={{ color: "var(--salt-sentiment-*-foreground-informative)" }}`

### Hierarchical layout

When displaying multiple metrics at different sizes to show hierarchy:

| Orientation | Container `StackLayout` props | Notes |
|---|---|---|
| Vertical hierarchy | `direction="row"` `gap={8}` `align="end"` | Side-by-side, bottom-aligned, smallest → largest |
| Horizontal hierarchy | `gap={8}` `align="end"` | Stacked rows, each row is a horizontal metric |

## Pattern Variants

### 1. Basic metric (vertical)
```
StackLayout(gap=0)
  └─ Text > <strong>Title</strong>
  └─ Display1 > value
```

### 2. Basic metric (horizontal)
```
StackLayout(direction="row", gap=1)
  └─ Text(marginTop=spacing-150) > <strong>Title</strong>
  └─ Display1 > value
```

### 3. With subtitle
```
StackLayout(gap=0)
  └─ Text > <strong>Title</strong>
  └─ Text(variant="secondary") > subtitle
  └─ Display1 > value
```

### 4. With subtitle and subvalue
```
StackLayout(gap=0)
  └─ Text > <strong>Title</strong>
  └─ Text(variant="secondary") > subtitle
  └─ Display1 > value
  └─ Text(color=sentiment-positive) > +10 (+1.23%)
```

### 5. With link subtitle
```
StackLayout(gap=0)
  └─ Text > <strong>Title</strong>
  └─ Link(variant="secondary") > subtitle
  └─ Display1 > value
  └─ Text(color=sentiment-positive) > +10 (+1.23%)
```

### 6. With indicators
```
StackLayout(gap=0)
  └─ Text > <strong>Title</strong>
  └─ Text(variant="secondary") > subtitle
  └─ Display1
  │    └─ value
  │    └─ ArrowUpIcon(size=3, fill=sentiment-positive-decorative)
  └─ Text(color=sentiment-positive) > +10 (+1.23%)
```

## Token Reference

| Token | Usage |
|---|---|
| `--salt-spacing-50` | Horizontal title `marginTop` for small (Display3) |
| `--salt-spacing-100` | Horizontal title `marginTop` for medium (Display2) |
| `--salt-spacing-150` | Horizontal title `marginTop` for large (Display1) |
| `--salt-sentiment-positive-foreground-decorative` | Positive indicator icon fill |
| `--salt-sentiment-positive-foreground-informative` | Positive subvalue text colour |
| `--salt-sentiment-negative-foreground-decorative` | Negative indicator icon fill |
| `--salt-sentiment-negative-foreground-informative` | Negative subvalue text colour |

## AI Generation Rules

### Select Metric pattern when
Intent matches: "metric", "KPI", "key number", "stat", "dashboard number", "performance indicator", "measurement" AND the value should be displayed prominently with optional context.

### Auto-configure

| Decision | Logic |
|---|---|
| **size** | "hero","primary","large" → `Display1` · "secondary","medium" → `Display2` · "tertiary","small","compact" → `Display3` · default: `Display1` |
| **orientation** | "horizontal","inline","side by side" → `direction="row"` · default: vertical |
| **subtitle** | Present if secondary descriptor text provided · Use `Link` variant if navigable |
| **subvalue** | Present if change/delta/comparison value provided |
| **indicator** | `ArrowUpIcon` if positive direction · `ArrowDownIcon` if negative direction · Omit if no directional change |
| **sentiment** | "positive","up","increase","gain" → positive tokens · "negative","down","decrease","loss" → negative tokens |

### Validation checklist
- [ ] `StackLayout` wraps all metric elements
- [ ] Vertical layout uses `gap={0}`; horizontal uses `direction="row"` `gap={1}`
- [ ] Title uses `Text` with `<strong>` for bold weight
- [ ] Subtitle uses `variant="secondary"` on `Text` or `Link`
- [ ] Display component matches intended size (Display1/2/3)
- [ ] Indicator icon is a **child of** the Display component, not a sibling
- [ ] Icon `size` prop matches Display level (3/2/1)
- [ ] Sentiment tokens applied via inline `style`, not className
- [ ] Horizontal title `marginTop` matches the size table (spacing-150/100/50)
