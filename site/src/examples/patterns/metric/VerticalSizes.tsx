import { Display1, Display2, Display3, StackLayout, Text } from "@salt-ds/core";
import { ArrowUpIcon } from "@salt-ds/icons";

export const VerticalSizes = () => {
  return (
    <StackLayout direction={"row"} gap={8} align="end">
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text color="secondary">Interactions</Text>
        <Display3>
          801
          <ArrowUpIcon
            style={{
              fill: "var(--salt-sentiment-positive-foreground-decorative)",
            }}
            size={1}
          />
        </Display3>
        <Text
          style={{
            color: "var(--salt-sentiment-positive-foreground-informative)",
          }}
        >
          +10 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text color="secondary">Interactions</Text>
        <Display2>
          801
          <ArrowUpIcon
            style={{
              fill: "var(--salt-sentiment-positive-foreground-decorative)",
            }}
            size={2}
          />
        </Display2>
        <Text
          style={{
            color: "var(--salt-sentiment-positive-foreground-informative)",
          }}
        >
          +10 (+1.23%)
        </Text>
      </StackLayout>
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text color="secondary">Interactions</Text>
        <Display1>
          801
          <ArrowUpIcon
            style={{
              fill: "var(--salt-sentiment-positive-foreground-decorative)",
            }}
            size={3}
          />
        </Display1>
        <Text
          style={{
            color: "var(--salt-sentiment-positive-foreground-informative)",
          }}
        >
          +10 (+1.23%)
        </Text>
      </StackLayout>
    </StackLayout>
  );
};
