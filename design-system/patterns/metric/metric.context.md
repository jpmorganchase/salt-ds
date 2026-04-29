# Metric (Copilot Context)

Displays a high-priority value with optional contextual subtitle, subvalue, and directional indicator.

- API: ./metric.json
- Guidance: ./metric.md

## Key rules
- Use `StackLayout` as the root composition container for metric content.
- Keep order fixed: title, optional subtitle/link, value (optional indicator), optional subvalue.
- Map size to value typography: `small=Display3`, `medium=Display2`, `large=Display1`.
- For horizontal orientation, apply size-based title top margin tokens for baseline alignment.
- Pair indicator direction with matching sentiment colors for indicator and subvalue text.
- Use subtitle links only for directly related navigation, not primary actions.

## Example
```tsx
import { Display1, Link, StackLayout, Text } from "@salt-ds/core";
import { ArrowUpIcon } from "@salt-ds/icons";

export function RevenueMetric() {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Revenue YTD</strong>
      </Text>
      <Link variant="secondary" href="#details">
        Total Value
      </Link>
      <Display1>
        $801.9B
        <ArrowUpIcon
          size={3}
          style={{
            fill: "var(--salt-sentiment-positive-foreground-decorative)",
          }}
        />
      </Display1>
      <Text
        style={{
          color: "var(--salt-sentiment-positive-foreground-informative)",
        }}
      >
        +10.1 (+1.23%)
      </Text>
    </StackLayout>
  );
}
```