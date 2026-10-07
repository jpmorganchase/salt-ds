import { Display1, Display2, Display3, StackLayout, Text } from "@salt-ds/core";

export const HorizontalSizes = () => {
  return (
    <StackLayout gap={8} align="end">
      <StackLayout direction="row" gap={1} align="baseline">
        <Text>
          <strong>Performance</strong>
        </Text>
        <Display3>801</Display3>
      </StackLayout>
      <StackLayout direction="row" gap={1} align="baseline">
        <Text>
          <strong>Performance</strong>
        </Text>
        <Display2>801</Display2>
      </StackLayout>
      <StackLayout direction="row" gap={1} align="baseline">
        <Text>
          <strong>Performance</strong>
        </Text>
        <Display1>801</Display1>
      </StackLayout>
    </StackLayout>
  );
};
