import { Button, StackLayout, StatusIndicator, Text } from "@salt-ds/core";

export const Error = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="error" size={2} />
      <StackLayout gap={1} align="center">
        <Text fontWeight="bolder">Access denied</Text>
        <Text>
          You do not have access to this data.
        </Text>
      </StackLayout>
      <Button>Log in</Button>
    </StackLayout>
  );
};
