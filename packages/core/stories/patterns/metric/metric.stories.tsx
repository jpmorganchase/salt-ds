import {
  StackLayout,
  Text,
  Display1,
  Display2,
  Display3,
  Link,
} from "@salt-ds/core";
import { ArrowUpIcon, ArrowDownIcon } from "@salt-ds/icons";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Metric",
} as Meta;

export const Metric = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Performance</strong>
      </Text>
      <Display1>801</Display1>
    </StackLayout>
  );
};

export const HorizontalMetric = () => {
  return (
    <StackLayout direction="row" gap={1}>
      <Text style={{ marginTop: "var(--salt-spacing-150)" }}>
        <strong>Performance</strong>
      </Text>
      <Display1>801</Display1>
    </StackLayout>
  );
};

export const Subtitle = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Performance</strong>
      </Text>
      <Text variant="secondary">Interactions</Text>
      <Display1>801</Display1>
    </StackLayout>
  );
};

export const Subvalue = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Performance</strong>
      </Text>
      <Text variant="secondary">Interactions</Text>
      <Display1>801</Display1>
      <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
        +10 (+1.23%)
      </Text>
    </StackLayout>
  );
};

export const LinkSubtitle = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Performance</strong>
      </Text>
      <Link variant="secondary">Interactions</Link>
      <Display1>801</Display1>
      <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
        +10 (+1.23%)
      </Text>
    </StackLayout>
  );
};

export const Indicators = () => {
  return (
    <StackLayout direction={"row"} gap={8}>
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text variant="secondary">Interactions</Text>
        <Display1>
          801
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={3}
          />
        </Display1>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text variant="secondary">Interactions</Text>
        <Display1>
          801
          <ArrowDownIcon
            style={{ fill: "var(--salt-status-negative-foreground)" }}
            size={3}
          />
        </Display1>
        <Text style={{ color: "var(--salt-status-negative-foreground)" }}>
          -10 (-1.23%)
        </Text>
      </StackLayout>
    </StackLayout>
  );
};

export const HierarchicalVertical = () => {
  return (
    <StackLayout direction={"row"} gap={8} align="end">
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text variant="secondary">Interactions</Text>
        <Display3>
          801
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={1}
          />
        </Display3>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text variant="secondary">Interactions</Text>
        <Display2>
          801
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={2}
          />
        </Display2>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text variant="secondary">Interactions</Text>
        <Display1>
          801
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={3}
          />
        </Display1>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10 (+1.23%)
        </Text>
      </StackLayout>
    </StackLayout>
  );
};

export const HierarchicalHorizontal = () => {
  return (
    <StackLayout gap={8} align="end">
      <StackLayout direction="row" gap={1}>
        <Text style={{ marginTop: "var(--salt-spacing-50)" }}>
          <strong>Performance</strong>
        </Text>
        <Display3>801</Display3>
      </StackLayout>
      <StackLayout direction="row" gap={1}>
        <Text style={{ marginTop: "var(--salt-spacing-100)" }}>
          <strong>Performance</strong>
        </Text>
        <Display2>801</Display2>
      </StackLayout>
      <StackLayout direction="row" gap={1}>
        <Text style={{ marginTop: "var(--salt-spacing-150)" }}>
          <strong>Performance</strong>
        </Text>
        <Display1>801</Display1>
      </StackLayout>
    </StackLayout>
  );
};
