import { StackLayout, StatusIndicator, Text } from "@salt-ds/core";

export const Success = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="success" size={2} />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};
