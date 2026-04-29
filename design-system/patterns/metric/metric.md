# Metric Pattern

## Source of truth
- Docs source: https://github.com/jpmorganchase/salt-ds/tree/main/site/docs/patterns/metric.mdx
- Stories source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/stories/patterns/metric/metric.stories.tsx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/patterns-metric--metric

## Pattern intent
The metric pattern highlights an important value so users can rapidly interpret performance, status, or trend in dashboards and summary surfaces.

Use this pattern when you need to:
- Emphasize one key value in a compact footprint.
- Add contextual support (subtitle, subvalue, indicator) without overwhelming the value itself.
- Show multiple metrics with clear visual hierarchy through size and positioning.

## Composition blueprint
Canonical composition (top to bottom in vertical orientation):

```text
StackLayout (root)
├── Text (title)
├── Text or Link (subtitle, optional)
├── Display1 | Display2 | Display3 (value)
│   └── ArrowUpIcon | ArrowDownIcon (optional, inline)
└── Text (subvalue, optional)
```

Order rules:
- Keep title before value in all orientations.
- Place subtitle directly below title when present.
- Place subvalue below the value when present.
- Place indicator inline with value and pair it with matching sentiment in subvalue.
- In horizontal orientation, align title vertically against value using size-specific top margin.

## Variant axes
Independent axes:
- Orientation: `vertical` (default), `horizontal`
- Size: `small`, `medium`, `large`
- Context level:
  - `title+value`
  - `title+subtitle+value`
  - `title+subtitle+value+subvalue`
  - `title+linkSubtitle+value+subvalue`
- Indicator: `none`, `up`, `down`
- Hierarchy mode: `single`, `hierarchical-set`

## Variant matrix
| Variant | Orientation | Size | Context | Indicator | Evidence | Source type | Inferred |
|---|---|---|---|---|---|---|---|
| Base metric | Vertical | Large | title+value | None | Stories: `Metric` | story | No |
| Horizontal metric | Horizontal | Large | title+value | None | Stories: `Horizontal Metric` | story | No |
| Subtitle | Vertical | Large | title+subtitle+value | None | Stories: `Subtitle` | story | No |
| Subvalue | Vertical | Large | title+subtitle+value+subvalue | None | Stories: `Subvalue` | story | No |
| Link subtitle | Vertical | Large | title+linkSubtitle+value+subvalue | None | Stories: `Link Subtitle` | story | No |
| Indicators | Vertical | Large | title+subtitle+value+subvalue | Up/Down | Stories: `Indicators` | story | No |
| Hierarchical vertical | Vertical | Small/Medium/Large | title+subtitle+value+subvalue | Up | Stories: `Hierarchical Vertical` | story | No |
| Hierarchical horizontal | Horizontal | Small/Medium/Large | title+value | None | Stories: `Hierarchical Horizontal` | story | No |

## Tokens and layout rules
Tokenized roles from stories/docs evidence:

Typography:
- Value styles: `Display3` (small), `Display2` (medium), `Display1` (large)
- Title: `Text` with strong emphasis
- Subtitle: `Text variant="secondary"` or `Link variant="secondary"`
- Subvalue: `Text` with sentiment informative foreground token

Spacing and alignment:
- Vertical stack gap: `0` (SOURCE_GAP: literal value in source)
- Horizontal metric gap: `var(--salt-spacing-100)`
- Horizontal title top margin:
  - Small: `var(--salt-spacing-50)`
  - Medium: `var(--salt-spacing-100)`
  - Large: `var(--salt-spacing-150)`

Sentiment color tokens:
- Positive indicator: `var(--salt-sentiment-positive-foreground-decorative)`
- Negative indicator: `var(--salt-sentiment-negative-foreground-decorative)`
- Positive subvalue: `var(--salt-sentiment-positive-foreground-informative)`
- Negative subvalue: `var(--salt-sentiment-negative-foreground-informative)`

Layout guidance:
- Use vertical orientation as default.
- Use horizontal orientation when line-length or dashboard density favors side-by-side scanning.
- Avoid more than five metrics in one dashboard view.

## Size and scale mappings
| Size | Value style | Indicator size | Horizontal title top margin |
|---|---|---|---|
| Small | `Display3` | `1` | `var(--salt-spacing-50)` |
| Medium | `Display2` | `2` | `var(--salt-spacing-100)` |
| Large | `Display1` | `3` | `var(--salt-spacing-150)` |

## Data requirements
- `title` (required): concise label for the metric.
- `value` (required): short, high-signal value (number or compact string).
- `subtitle` (optional): context label; can be static text or a link.
- `subvalue` (optional): delta/comparison/threshold context.
- `indicator` (optional): directional state (`up` or `down`) derived from business logic.
- `hierarchy` (optional): when rendering multiple metrics, caller decides priority order and size mapping.

## Gap analysis
1. Missing token
   - Evidence: stories use literal `gap={0}`.
   - Impact: no explicit semantic token reference for zero spacing.
   - Recommendation: normalize docs to a semantic spacing role and keep literal fallback.
   - Label: `SOURCE_GAP`

2. Undocumented variant combination
   - Evidence: docs define axes independently, but not every `size × orientation × context` combination is explicitly shown.
   - Impact: implementation generators may miss valid combinations.
   - Recommendation: treat matrix combinations as axis-composable and flag inferred rows.
   - Label: `SOURCE_GAP`

## Validation checklist
- [ ] Root composition follows title → subtitle/link → value(+indicator) → subvalue.
- [ ] Size mappings use `Display3/2/1` and indicator sizes `1/2/3`.
- [ ] Horizontal alignment uses size-based top margins.
- [ ] Indicator and subvalue sentiment colors match direction semantics.
- [ ] Variant selection reflects documented axes before custom combinations.

## Primary references
- Docs source: https://github.com/jpmorganchase/salt-ds/tree/main/site/docs/patterns/metric.mdx
- Stories source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/stories/patterns/metric/metric.stories.tsx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/patterns-metric--metric
  - https://storybook.saltdesignsystem.com/?path=/story/patterns-metric--horizontal-metric
  - https://storybook.saltdesignsystem.com/?path=/story/patterns-metric--indicators

## AI generation rules (required)
### Select this pattern when
- You need to highlight one or more key values in dashboard or summary UI.
- Users must quickly compare trend direction with optional supporting context.
- The value is the primary information and supporting labels are secondary.

### Auto-configure
- Default to vertical orientation with `large` size for single, high-priority metric.
- If rendering compact collections, map lower-priority cards to `medium` or `small`.
- When trend data exists, enable indicator and apply matching sentiment token to subvalue.
- Use link subtitle only when navigation is a secondary action directly tied to the metric.

### Validation
- Confirm all required inputs: title and value.
- Confirm orientation/size pair has matching spacing and typography mapping.
- Confirm indicator direction, icon, and sentiment color are consistent.
- Confirm metric count per viewport avoids visual overload (target 5 or fewer).