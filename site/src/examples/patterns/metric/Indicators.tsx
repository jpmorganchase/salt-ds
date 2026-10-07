import { Display1, StackLayout, Text } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";

export const Indicators = () => {
  return (
    <StackLayout direction={"row"} gap={8}>
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
      <StackLayout gap={0}>
        <Text>
          <strong>Performance</strong>
        </Text>
        <Text color="secondary">Interactions</Text>
        <Display1>
          801
          <ArrowDownIcon
            style={{
              fill: "var(--salt-sentiment-negative-foreground-decorative)",
            }}
            size={3}
          />
        </Display1>
        <Text
          style={{
            color: "var(--salt-sentiment-negative-foreground-informative)",
          }}
        >
          -10 (-1.23%)
        </Text>
      </StackLayout>
    </StackLayout>
  );
};
