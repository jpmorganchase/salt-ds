import { Display1, StackLayout, Text } from "@salt-ds/core";

export const HorizontalMetric = () => {
  return (
    <StackLayout direction="row" gap={1} align="baseline">
      <Text>
        <strong>Performance</strong>
      </Text>
      <Display1>801</Display1>
    </StackLayout>
  );
};
