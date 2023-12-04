import {
  StackLayout,
  Text,
  Display1,
  Display2,
  Display3,
  Link,
  H1,
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
        <strong>Revenue YTD</strong>
      </Text>
      <Display1>$801.9B</Display1>
    </StackLayout>
  );
};

export const HorizontalMetric = () => {
  return (
    <StackLayout direction="row" gap={1}>
      <Text>
        <strong>Revenue YTD</strong>
      </Text>
      <Display1 style={{ lineHeight: "0.8" }}>$801.9B</Display1>
    </StackLayout>
  );
};

export const Subtitle = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Revenue YTD</strong>
      </Text>
      <Text variant="secondary">Total Value</Text>
      <Display1>$801.9B</Display1>
    </StackLayout>
  );
};

export const Subvalue = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Revenue YTD</strong>
      </Text>
      <Text variant="secondary">Total Value</Text>
      <Display1>$801.9B</Display1>
      <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
        +10.1 (+1.23%)
      </Text>
    </StackLayout>
  );
};

export const LinkSubtitle = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Revenue YTD</strong>
      </Text>
      <H1>
        header with{" "}
        <Link styleAs="h1" variant="secondary">
          Total Value
        </Link>{" "}
        link
      </H1>
      <Link styleAs="h1" variant="secondary">
        Total Value
      </Link>
      <Display1>$801.9B</Display1>
      <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
        +10.1 (+1.23%)
      </Text>
    </StackLayout>
  );
};

export const Indicators = () => {
  return (
    <StackLayout direction={"row"} gap={8}>
      <StackLayout gap={0}>
        <Text>
          <strong>Revenue YTD</strong>
        </Text>
        <Text variant="secondary">Total Value</Text>
        <Display1>
          $801.9B
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={2}
          />
        </Display1>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10.1 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Revenue YTD</strong>
        </Text>
        <Text variant="secondary">Total Value</Text>
        <Display1>
          $801.9B
          <ArrowDownIcon
            style={{ fill: "var(--salt-status-negative-foreground)" }}
            size={2}
          />
        </Display1>
        <Text style={{ color: "var(--salt-status-negative-foreground)" }}>
          -10.1 (+1.23%)
        </Text>
      </StackLayout>
    </StackLayout>
  );
};

export const Hierarchical = () => {
  return (
    <StackLayout direction={"row"} gap={8} align="end">
      <StackLayout gap={0}>
        <Text>
          <strong>Revenue YTD</strong>
        </Text>
        <Text variant="secondary">Total Value</Text>
        <Display3>
          $801.9B
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={1}
          />
        </Display3>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10.1 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Revenue YTD</strong>
        </Text>
        <Text variant="secondary">Total Value</Text>
        <Display2>
          $801.9B
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={2}
          />
        </Display2>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10.1 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Revenue YTD</strong>
        </Text>
        <Text variant="secondary">Total Value</Text>
        <Display1>
          $801.9B
          <ArrowUpIcon
            style={{ fill: "var(--salt-status-positive-foreground)" }}
            size={2}
          />
        </Display1>
        <Text style={{ color: "var(--salt-status-positive-foreground)" }}>
          +10.1 (+1.23%)
        </Text>
      </StackLayout>
    </StackLayout>
  );
};
