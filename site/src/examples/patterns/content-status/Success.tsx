import { StackLayout, StatusIndicator, Text } from "@salt-ds/core";

export const Success = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="success" size={2} />
      <StackLayout gap={1} align="center">
        <Text fontWeight="bolder">Message submitted</Text>
        <Text>
          Your message has been received and a member of our team will respond
          shortly.
        </Text>
      </StackLayout>
    </StackLayout>
  );
};
