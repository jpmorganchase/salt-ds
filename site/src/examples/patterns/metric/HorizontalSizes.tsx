import { Display1, Display2, Display3, StackLayout, Text } from "@salt-ds/core";

// The title sits near the top of the value, offset by the spacing for the
// metric's size, as the spacing specs show.
export const HorizontalSizes = () => {
  return (
    <StackLayout gap={8}>
      <StackLayout direction="row" gap={1} align="start">
        <Text
          fontWeight="bolder"
          style={{ paddingTop: "var(--salt-spacing-150)" }}
        >
          Performance
        </Text>
        <Display1>801</Display1>
      </StackLayout>
      <StackLayout direction="row" gap={1} align="start">
        <Text
          fontWeight="bolder"
          style={{ paddingTop: "var(--salt-spacing-100)" }}
        >
          Performance
        </Text>
        <Display2>801</Display2>
      </StackLayout>
      <StackLayout direction="row" gap={1} align="start">
        <Text
          fontWeight="bolder"
          style={{ paddingTop: "var(--salt-spacing-50)" }}
        >
          Performance
        </Text>
        <Display3>801</Display3>
      </StackLayout>
    </StackLayout>
  );
};
